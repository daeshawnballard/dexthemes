import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { constants as fsConstants } from 'node:fs';
import {
  chmod,
  lstat,
  mkdir,
  mkdtemp,
  open,
  readdir,
  realpath,
} from 'node:fs/promises';
import { homedir, tmpdir } from 'node:os';
import { basename, isAbsolute, join, parse, resolve, sep } from 'node:path';
import { TextDecoder } from 'node:util';
import { isStrictT3ThemeFile } from './validate-theme.mjs';

export const MAX_T3_THEME_FILE_BYTES = 32 * 1024;
export const T3_THEME_BUNDLE_ID = 'com.t3tools.t3code';
export const T3_THEME_APPLY_TIMEOUT_MS = 30_000;

const MAX_INFO_PLIST_BYTES = 128 * 1024;
const MAX_SETTINGS_BYTES = 1024 * 1024;
const ID_PREFIX = 'dexthemes-';
const THEME_ID_PATTERN = /^[a-z0-9](?:[a-z0-9-]{0,47})$/;
const SHA256_PATTERN = /^[a-f0-9]{64}$/;
const PREPARED_INPUTS = new WeakMap();

function errorWithCode(message, code) {
  const error = new Error(message);
  error.code = code;
  return error;
}

function isErrno(error, code) {
  return error && typeof error === 'object' && error.code === code;
}

async function readRegularFileNoFollow(filePath, maxBytes, { missingOk = false } = {}) {
  let handle;
  try {
    const flags = fsConstants.O_RDONLY
      | (fsConstants.O_NOFOLLOW ?? 0)
      | (fsConstants.O_NONBLOCK ?? 0);
    handle = await open(filePath, flags);
  } catch (error) {
    if (missingOk && isErrno(error, 'ENOENT')) return null;
    if (isErrno(error, 'ELOOP')) throw errorWithCode('Input must not be a symbolic link.', 'SYMLINK');
    throw errorWithCode('Could not safely open the requested regular file.', error.code ?? 'OPEN_FAILED');
  }

  try {
    const before = await handle.stat();
    if (!before.isFile()) throw errorWithCode('Input must be a regular file.', 'NOT_REGULAR');
    if (before.size > maxBytes) throw errorWithCode(`Input exceeds the ${maxBytes}-byte limit.`, 'TOO_LARGE');

    if (fsConstants.O_NOFOLLOW === undefined) {
      const pathInfo = await lstat(filePath);
      if (pathInfo.isSymbolicLink() || pathInfo.dev !== before.dev || pathInfo.ino !== before.ino) {
        throw errorWithCode('Input must not be a symbolic link.', 'SYMLINK');
      }
    }

    const buffer = Buffer.alloc(maxBytes + 1);
    let total = 0;
    while (total < buffer.length) {
      const { bytesRead } = await handle.read(buffer, total, buffer.length - total, total);
      if (bytesRead === 0) break;
      total += bytesRead;
    }
    if (total > maxBytes) throw errorWithCode(`Input exceeds the ${maxBytes}-byte limit.`, 'TOO_LARGE');

    const after = await handle.stat();
    if (before.dev !== after.dev || before.ino !== after.ino
      || before.size !== after.size || before.mtimeMs !== after.mtimeMs || before.ctimeMs !== after.ctimeMs) {
      throw errorWithCode('Input changed while it was being read.', 'CHANGED_DURING_READ');
    }
    return buffer.subarray(0, total);
  } finally {
    await handle.close();
  }
}

function parseUtf8Json(bytes, description) {
  let text;
  try {
    text = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch {
    throw errorWithCode(`${description} must be valid UTF-8 JSON.`, 'INVALID_UTF8');
  }
  try {
    return JSON.parse(text);
  } catch {
    throw errorWithCode(`${description} must contain valid JSON.`, 'INVALID_JSON');
  }
}

function validateThemeBytes(bytes) {
  if (!Buffer.isBuffer(bytes) || bytes.length > MAX_T3_THEME_FILE_BYTES) {
    throw errorWithCode(`Theme input exceeds the ${MAX_T3_THEME_FILE_BYTES}-byte limit.`, 'TOO_LARGE');
  }
  const value = parseUtf8Json(bytes, 'T3 Code theme input');
  if (!isStrictT3ThemeFile(value)) {
    throw errorWithCode('Theme input does not satisfy the strict T3 Code stable v1 contract.', 'INVALID_THEME');
  }
  return value;
}

function sha256(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

export function deriveT3ThemeId(inputSha256) {
  if (typeof inputSha256 !== 'string' || !SHA256_PATTERN.test(inputSha256)) {
    throw new TypeError('Expected a lowercase SHA-256 digest.');
  }
  // T3 Code caps environment IDs at 48 characters. The content-derived prefix
  // carries 152 digest bits; destination equality checks reject any collision.
  return `${ID_PREFIX}${inputSha256.slice(0, 48 - ID_PREFIX.length)}`;
}

async function writePrivateStage(bytes) {
  const stageDirectory = await mkdtemp(join(tmpdir(), 'dexthemes-t3-apply-'));
  const stagedInputPath = join(stageDirectory, 'theme.json');
  try {
    await chmod(stageDirectory, 0o700);
    const stageInfo = await lstat(stageDirectory);
    if (!stageInfo.isDirectory() || stageInfo.isSymbolicLink() || (stageInfo.mode & 0o777) !== 0o700) {
      throw errorWithCode('Could not create a private T3 theme staging directory.', 'STAGE_DIR_UNSAFE');
    }

    const flags = fsConstants.O_WRONLY | fsConstants.O_CREAT | fsConstants.O_EXCL
      | (fsConstants.O_NOFOLLOW ?? 0);
    const handle = await open(stagedInputPath, flags, 0o600);
    try {
      await handle.writeFile(bytes);
      await handle.sync();
      await handle.chmod(0o600);
    } finally {
      await handle.close();
    }
  } catch (error) {
    error.stagingDirectory = stageDirectory;
    error.stagedInputPath = stagedInputPath;
    throw error;
  }
  return { stageDirectory, stagedInputPath };
}

async function createPreparedInput(inputPath) {
  if (typeof inputPath !== 'string' || inputPath.length === 0) {
    throw new TypeError('inputPath must name a T3 Code theme JSON file.');
  }
  const bytes = await readRegularFileNoFollow(inputPath, MAX_T3_THEME_FILE_BYTES);
  const value = validateThemeBytes(bytes);
  const inputHash = sha256(bytes);
  const themeId = deriveT3ThemeId(inputHash);
  const stage = await writePrivateStage(bytes);
  const prepared = Object.freeze({
    inputHash,
    themeId,
    name: value.name,
    appearance: value.appearance,
    stagingDirectory: stage.stageDirectory,
    stagedInputPath: stage.stagedInputPath,
  });
  PREPARED_INPUTS.set(prepared, { ...stage, inputHash, themeId });
  return prepared;
}

/** Read and strictly validate a theme, then preserve the exact bytes in a private stage. */
export async function prepareT3ThemeFile(inputPath) {
  return createPreparedInput(inputPath);
}

export function getDefaultT3StatePaths(homeDirectory = homedir()) {
  if (typeof homeDirectory !== 'string' || !isAbsolute(homeDirectory)) {
    throw new TypeError('The T3 home directory must be an absolute path.');
  }
  const home = resolve(homeDirectory);
  const baseDirectory = join(home, '.t3');
  const stateDirectory = join(baseDirectory, 'userdata');
  return Object.freeze({
    homeDirectory: home,
    baseDirectory,
    stateDirectory,
    themesDirectory: join(stateDirectory, 'themes'),
    settingsPath: join(stateDirectory, 'settings.json'),
  });
}

async function inspectDirectory(directoryPath) {
  try {
    const info = await lstat(directoryPath);
    if (info.isSymbolicLink()) throw errorWithCode('T3 state paths must not contain symbolic links.', 'SYMLINK');
    if (!info.isDirectory()) throw errorWithCode('T3 state path component must be a directory.', 'NOT_DIRECTORY');
    return true;
  } catch (error) {
    if (isErrno(error, 'ENOENT')) return false;
    throw error;
  }
}

async function inspectSettings(settingsPath) {
  const bytes = await readRegularFileNoFollow(settingsPath, MAX_SETTINGS_BYTES, { missingOk: true });
  if (bytes === null) return { defaultThemeId: null, defaultThemeSetAt: null };
  const settings = parseUtf8Json(bytes, 'T3 settings');
  if (!settings || typeof settings !== 'object' || Array.isArray(settings)) {
    throw errorWithCode('T3 settings must be a JSON object.', 'INVALID_SETTINGS');
  }
  const defaultTheme = settings.defaultTheme ?? '';
  const defaultThemeSetAt = settings.defaultThemeSetAt ?? '';
  if (typeof defaultTheme !== 'string' || typeof defaultThemeSetAt !== 'string') {
    throw errorWithCode('T3 theme settings fields have unexpected types.', 'INVALID_SETTINGS');
  }
  return {
    defaultThemeId: defaultTheme.length > 0 ? defaultTheme : null,
    defaultThemeSetAt: defaultThemeSetAt.length > 0 ? defaultThemeSetAt : null,
  };
}

async function assertSafeT3Home(homeDirectory) {
  const canonicalHome = await realpath(homeDirectory);
  if (canonicalHome !== resolve(homeDirectory)) {
    throw errorWithCode('The T3 home directory resolves through a symbolic link.', 'SYMLINK');
  }
  const info = await lstat(homeDirectory);
  if (!info.isDirectory() || info.isSymbolicLink()) {
    throw errorWithCode('The T3 home directory must be a real directory.', 'NOT_DIRECTORY');
  }
}

/** Read-only inspection of the exact default ~/.t3/userdata state paths. */
export async function inspectT3DefaultState(homeDirectory = homedir()) {
  const paths = getDefaultT3StatePaths(homeDirectory);
  await assertSafeT3Home(paths.homeDirectory);
  const baseExists = await inspectDirectory(paths.baseDirectory);
  const stateExists = baseExists && await inspectDirectory(paths.stateDirectory);
  const themesExists = stateExists && await inspectDirectory(paths.themesDirectory);

  let settings = { defaultThemeId: null, defaultThemeSetAt: null };
  if (stateExists) settings = await inspectSettings(paths.settingsPath);
  return Object.freeze({
    paths,
    baseExists,
    stateExists,
    themesExists,
    ...settings,
  });
}

async function ensureOneDirectory(directoryPath) {
  try {
    await mkdir(directoryPath, { mode: 0o700 });
  } catch (error) {
    if (!isErrno(error, 'EEXIST')) throw error;
  }
  const info = await lstat(directoryPath);
  if (info.isSymbolicLink() || !info.isDirectory()) {
    throw errorWithCode('T3 state paths must not contain symbolic links or non-directory components.', 'UNSAFE_DIRECTORY');
  }
}

async function ensureT3DefaultDirectories(homeDirectory) {
  const paths = getDefaultT3StatePaths(homeDirectory);
  await assertSafeT3Home(paths.homeDirectory);
  await ensureOneDirectory(paths.baseDirectory);
  await ensureOneDirectory(paths.stateDirectory);
  await ensureOneDirectory(paths.themesDirectory);
  const state = await inspectT3DefaultState(paths.homeDirectory);
  return { paths, state };
}

function assertThemeId(themeId) {
  if (typeof themeId !== 'string' || !THEME_ID_PATTERN.test(themeId)) {
    throw new TypeError('Theme ID must use lowercase letters, numbers, and hyphens (48 characters maximum).');
  }
}

function assertSha256(inputHash) {
  if (typeof inputHash !== 'string' || !SHA256_PATTERN.test(inputHash)) {
    throw new TypeError('Expected a lowercase SHA-256 digest.');
  }
}

/** Pure argument builder for the single supported semantic T3 operation. */
export function buildT3ThemeSetArguments({ baseDirectory, stagedInputPath, themeId }) {
  assertThemeId(themeId);
  if (typeof baseDirectory !== 'string' || !isAbsolute(baseDirectory)
    || typeof stagedInputPath !== 'string' || !isAbsolute(stagedInputPath)) {
    throw new TypeError('T3 theme command paths must be absolute.');
  }
  return Object.freeze([
    'theme',
    'set',
    '--base-dir',
    baseDirectory,
    '--id',
    themeId,
    stagedInputPath,
  ]);
}

async function assertNoSymlinkComponents(directoryPath) {
  if (typeof directoryPath !== 'string' || !isAbsolute(directoryPath)) {
    throw new TypeError('T3 themes directory must be an absolute path.');
  }
  const normalized = resolve(directoryPath);
  const root = parse(normalized).root;
  let current = root;
  for (const component of normalized.slice(root.length).split(sep).filter(Boolean)) {
    current = join(current, component);
    try {
      const info = await lstat(current);
      if (info.isSymbolicLink()) throw errorWithCode('T3 themes paths must not contain symbolic links.', 'SYMLINK');
      if (current !== normalized && !info.isDirectory()) {
        throw errorWithCode('T3 themes path components must be directories.', 'NOT_DIRECTORY');
      }
    } catch (error) {
      if (isErrno(error, 'ENOENT')) return;
      throw error;
    }
  }
}

/** Inspect a content-derived destination without changing it. */
export async function inspectT3ThemeDestination(themesDirectory, themeId, inputHash) {
  assertThemeId(themeId);
  assertSha256(inputHash);
  await assertNoSymlinkComponents(themesDirectory);
  const destinationPath = join(themesDirectory, `${themeId}.json`);
  const bytes = await readRegularFileNoFollow(destinationPath, MAX_T3_THEME_FILE_BYTES, { missingOk: true });
  if (bytes === null) return Object.freeze({ destinationPath, exists: false, publishedHash: null });

  const publishedHash = sha256(bytes);
  if (publishedHash !== inputHash) {
    throw errorWithCode('A different theme already exists at the content-derived T3 theme ID.', 'DESTINATION_CONFLICT');
  }
  return Object.freeze({ destinationPath, exists: true, publishedHash });
}

async function requireRealDirectory(directoryPath) {
  const info = await lstat(directoryPath);
  if (info.isSymbolicLink() || !info.isDirectory()) {
    throw errorWithCode('T3 application bundle contains an unsafe directory path.', 'UNSAFE_APP_PATH');
  }
}

function readPlistString(plistText, key) {
  const keyTag = `<key>${key}</key>`;
  const valueStart = plistText.indexOf(keyTag);
  if (valueStart < 0) return null;
  const following = plistText.slice(valueStart + keyTag.length).trimStart();
  const openTag = '<string>';
  const closeTag = '</string>';
  if (!following.startsWith(openTag)) return null;
  const end = following.indexOf(closeTag, openTag.length);
  return end < 0 ? null : following.slice(openTag.length, end);
}

async function inspectT3Application(appPath) {
  const appInfo = await lstat(appPath);
  if (appInfo.isSymbolicLink() || !appInfo.isDirectory()) return null;

  const contentsPath = join(appPath, 'Contents');
  await requireRealDirectory(contentsPath);
  const infoPath = join(contentsPath, 'Info.plist');
  const infoBytes = await readRegularFileNoFollow(infoPath, MAX_INFO_PLIST_BYTES);
  const plistText = new TextDecoder('utf-8', { fatal: true }).decode(infoBytes);
  const bundleId = readPlistString(plistText, 'CFBundleIdentifier');
  const bundleName = readPlistString(plistText, 'CFBundleName');
  const version = readPlistString(plistText, 'CFBundleShortVersionString');
  const executableName = readPlistString(plistText, 'CFBundleExecutable');
  if (bundleId !== T3_THEME_BUNDLE_ID || !bundleName?.startsWith('T3 Code ') && bundleName !== 'T3 Code') return null;
  if (!version || !executableName || basename(executableName) !== executableName || executableName === '.' || executableName === '..') {
    throw errorWithCode('Installed T3 application metadata is incomplete.', 'INVALID_APP_METADATA');
  }

  const macOSPath = join(contentsPath, 'MacOS');
  const resourcesPath = join(contentsPath, 'Resources');
  await requireRealDirectory(contentsPath);
  await requireRealDirectory(macOSPath);
  await requireRealDirectory(resourcesPath);
  const electronExecutable = join(macOSPath, executableName);
  const electronInfo = await lstat(electronExecutable);
  if (electronInfo.isSymbolicLink() || !electronInfo.isFile() || (electronInfo.mode & 0o111) === 0) {
    throw errorWithCode('Installed T3 Electron executable is unavailable or unsafe.', 'INVALID_ELECTRON');
  }
  const appAsarPath = join(resourcesPath, 'app.asar');
  const asarInfo = await lstat(appAsarPath);
  if (asarInfo.isSymbolicLink() || !asarInfo.isFile()) {
    throw errorWithCode('Installed T3 application archive is unavailable or unsafe.', 'INVALID_APP_ARCHIVE');
  }
  return Object.freeze({
    appPath,
    bundleId,
    bundleName,
    version,
    electronExecutable,
    appAsarPath,
  });
}

async function discoverT3Application() {
  if (process.platform !== 'darwin') {
    throw errorWithCode('Automatic T3 theme application is supported only on macOS.', 'UNSUPPORTED_PLATFORM');
  }
  const roots = ['/Applications', join(homedir(), 'Applications')];
  const matches = [];
  for (const root of roots) {
    let rootInfo;
    try {
      rootInfo = await lstat(root);
    } catch (error) {
      if (isErrno(error, 'ENOENT')) continue;
      throw error;
    }
    if (rootInfo.isSymbolicLink() || !rootInfo.isDirectory()) {
      throw errorWithCode('T3 application search roots must be real directories.', 'UNSAFE_APP_ROOT');
    }
    for (const entry of await readdir(root, { withFileTypes: true })) {
      if (!entry.isDirectory() || !entry.name.endsWith('.app')) continue;
      try {
        const app = await inspectT3Application(join(root, entry.name));
        if (app) matches.push(app);
      } catch (error) {
        if (/^T3 Code(?:\s|\.)/i.test(entry.name)) throw error;
      }
    }
  }
  if (matches.length === 0) throw errorWithCode('No installed T3 Code standard or nightly application was found.', 'T3_NOT_INSTALLED');
  if (matches.length > 1) throw errorWithCode('Multiple installed T3 Code applications share the official bundle ID.', 'T3_APP_AMBIGUOUS');
  return matches[0];
}

function runT3ThemeSet(app, statePaths, stage, themeId) {
  const args = buildT3ThemeSetArguments({
    baseDirectory: statePaths.baseDirectory,
    stagedInputPath: stage.stagedInputPath,
    themeId,
  });
  const cliEntry = join(app.appAsarPath, 'apps/server/dist/bin.mjs');
  const env = {
    HOME: statePaths.homeDirectory,
    ELECTRON_RUN_AS_NODE: '1',
    TMPDIR: tmpdir(),
  };
  return new Promise((resolveResult) => {
    let settled = false;
    let timedOut = false;
    let timeoutTimer;
    let killTimer;
    const finish = (result) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeoutTimer);
      clearTimeout(killTimer);
      resolveResult(result);
    };

    let child;
    try {
      child = spawn(app.electronExecutable, [cliEntry, ...args], {
        cwd: statePaths.baseDirectory,
        env,
        shell: false,
        windowsHide: true,
        stdio: 'ignore',
      });
    } catch (error) {
      finish({ exitCode: null, errorCode: error.code ?? 'SPAWN_FAILED' });
      return;
    }

    timeoutTimer = setTimeout(() => {
      timedOut = true;
      child.kill('SIGTERM');
      killTimer = setTimeout(() => child.kill('SIGKILL'), 5_000);
      killTimer.unref?.();
    }, T3_THEME_APPLY_TIMEOUT_MS);
    timeoutTimer.unref?.();
    child.once('error', (error) => finish({ exitCode: null, errorCode: error.code ?? 'SPAWN_FAILED' }));
    child.once('close', (code, signal) => finish({
      exitCode: code,
      errorCode: timedOut ? 'TIMEOUT' : signal ? `SIGNAL_${signal}` : null,
    }));
  });
}

async function ensurePreparedBytes(prepared, expectedSha256) {
  const metadata = PREPARED_INPUTS.get(prepared);
  if (!metadata) throw errorWithCode('Prepared T3 input was not created by this module instance.', 'INVALID_PREPARED_INPUT');
  assertSha256(expectedSha256);
  if (metadata.inputHash !== expectedSha256 || prepared.inputHash !== expectedSha256) {
    throw errorWithCode('The reviewed SHA-256 does not match the prepared T3 theme input.', 'HASH_MISMATCH');
  }
  const bytes = await readRegularFileNoFollow(metadata.stagedInputPath, MAX_T3_THEME_FILE_BYTES);
  validateThemeBytes(bytes);
  if (sha256(bytes) !== expectedSha256) {
    throw errorWithCode('The prepared T3 theme changed after review.', 'HASH_MISMATCH');
  }
  return { metadata, bytes };
}

async function applyPrepared(prepared, expectedSha256) {
  const { metadata, bytes } = await ensurePreparedBytes(prepared, expectedSha256);

  // Inspect before creating anything, then verify again immediately before the
  // CLI write. This pins the only writable state to the default ~/.t3 tree.
  await inspectT3DefaultState();
  const app = await discoverT3Application();
  const { paths, state: before } = await ensureT3DefaultDirectories(homedir());
  if (await inspectDirectory(paths.stateDirectory) !== true || await inspectDirectory(paths.themesDirectory) !== true) {
    throw errorWithCode('T3 default state directories are unavailable.', 'STATE_UNAVAILABLE');
  }
  const settingsInfo = await lstat(paths.settingsPath).catch((error) => {
    if (isErrno(error, 'ENOENT')) return null;
    throw error;
  });
  if (settingsInfo && (settingsInfo.isSymbolicLink() || !settingsInfo.isFile())) {
    throw errorWithCode('T3 settings path must be a regular file and must not be a symbolic link.', 'UNSAFE_SETTINGS');
  }
  await inspectT3ThemeDestination(paths.themesDirectory, metadata.themeId, expectedSha256);

  const command = await runT3ThemeSet(app, paths, metadata, metadata.themeId);
  let publishedHash = null;
  let defaultThemeId = null;
  let defaultThemeSetAt = null;
  let readbackErrorCode = null;
  try {
    const published = await readRegularFileNoFollow(
      join(paths.themesDirectory, `${metadata.themeId}.json`),
      MAX_T3_THEME_FILE_BYTES,
      { missingOk: true },
    );
    if (published !== null) publishedHash = sha256(published);
    const after = await inspectT3DefaultState(paths.homeDirectory);
    defaultThemeId = after.defaultThemeId;
    defaultThemeSetAt = after.defaultThemeSetAt;
  } catch (error) {
    readbackErrorCode = error.code ?? 'READBACK_FAILED';
  }

  return Object.freeze({
    exitCode: command.exitCode,
    errorCode: command.errorCode,
    readbackErrorCode,
    inputHash: expectedSha256,
    publishedHash,
    themeId: metadata.themeId,
    name: prepared.name,
    appearance: prepared.appearance,
    appBundleId: app.bundleId,
    appVersion: app.version,
    defaultThemeId,
    defaultThemeSetAt,
    previousDefaultThemeId: before.defaultThemeId,
    previousDefaultThemeSetAt: before.defaultThemeSetAt,
    stagingDirectory: metadata.stageDirectory,
    stagedInputPath: metadata.stagedInputPath,
    receiptConsistent: command.exitCode === 0
      && command.errorCode === null
      && publishedHash === expectedSha256
      && defaultThemeId === metadata.themeId
      && readbackErrorCode === null,
  });
}

/**
 * Apply the exact reviewed file through T3 Code's bundled semantic CLI.
 * receiptConsistent covers CLI exit, published bytes, and settings readback;
 * it does not establish native rendering in the desktop UI.
 */
export async function applyT3Theme({ inputPath, expectedSha256 } = {}) {
  assertSha256(expectedSha256);
  const bytes = await readRegularFileNoFollow(inputPath, MAX_T3_THEME_FILE_BYTES);
  const value = validateThemeBytes(bytes);
  const inputHash = sha256(bytes);
  if (inputHash !== expectedSha256) {
    throw errorWithCode('The reviewed SHA-256 does not match the T3 theme input.', 'HASH_MISMATCH');
  }
  const stage = await writePrivateStage(bytes);
  const prepared = Object.freeze({
    inputHash,
    themeId: deriveT3ThemeId(inputHash),
    name: value.name,
    appearance: value.appearance,
    stagingDirectory: stage.stageDirectory,
    stagedInputPath: stage.stagedInputPath,
  });
  PREPARED_INPUTS.set(prepared, { ...stage, inputHash, themeId: prepared.themeId });
  try {
    return await applyPrepared(prepared, expectedSha256);
  } catch (error) {
    if (error && typeof error === 'object') {
      error.stagingDirectory = stage.stageDirectory;
      error.stagedInputPath = stage.stagedInputPath;
    }
    throw error;
  }
}

/** Apply a previously returned prepared object after an explicit hash review. */
export async function applyPreparedT3Theme(prepared, expectedSha256) {
  return applyPrepared(prepared, expectedSha256);
}
