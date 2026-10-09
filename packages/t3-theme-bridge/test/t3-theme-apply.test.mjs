import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { lstat, mkdir, mkdtemp, readFile, realpath, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { T3CODE_THEME_COLOR_ROLES } from '../../../shared/t3code-theme-contract.js';
import {
  applyT3Theme,
  applyPreparedT3Theme,
  buildT3ThemeSetArguments,
  deriveT3ThemeId,
  getDefaultT3StatePaths,
  inspectT3DefaultState,
  inspectT3ThemeDestination,
  MAX_T3_THEME_FILE_BYTES,
  prepareT3ThemeFile,
} from '../src/t3-theme-apply.mjs';

async function makeTempDirectory(prefix = 'dexthemes-t3-apply-test-') {
  return realpath(await mkdtemp(join(tmpdir(), prefix)));
}

function fixtureValue(overrides = {}) {
  return {
    version: 1,
    id: 'review-fixture',
    name: 'Review fixture',
    appearance: 'dark',
    colors: Object.fromEntries(T3CODE_THEME_COLOR_ROLES.map((role) => [role, '#223344'])),
    ...overrides,
  };
}

function fixtureBytes(value = fixtureValue()) {
  return Buffer.from(`${JSON.stringify(value)}\n`, 'utf8');
}

function hash(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

test('prepare preserves exact validated bytes in a private stage and derives a bounded content ID', async () => {
  const root = await makeTempDirectory();
  const inputPath = join(root, 'reviewed-theme.json');
  const bytes = fixtureBytes();
  await writeFile(inputPath, bytes, { mode: 0o600 });

  const prepared = await prepareT3ThemeFile(inputPath);
  const stagedBytes = await readFile(prepared.stagedInputPath);
  const directoryInfo = await lstat(prepared.stagingDirectory);
  const fileInfo = await lstat(prepared.stagedInputPath);

  assert.deepEqual(stagedBytes, bytes);
  assert.equal(prepared.inputHash, hash(bytes));
  assert.equal(prepared.themeId, deriveT3ThemeId(prepared.inputHash));
  assert.equal(prepared.themeId.length, 48);
  assert.equal(directoryInfo.mode & 0o777, 0o700);
  assert.equal(fileInfo.mode & 0o777, 0o600);
});

test('strict stable-v1 validation rejects extra roots, roles, wrong types, and invalid colors', async () => {
  const root = await makeTempDirectory();
  const invalidValues = [
    fixtureValue({ managed: true }),
    fixtureValue({ colors: { ...fixtureValue().colors, unrecognizedRole: '#112233' } }),
    fixtureValue({ colors: { ...fixtureValue().colors, text: 123 } }),
    fixtureValue({ colors: { ...fixtureValue().colors, text: 'url(https://example.invalid)' } }),
  ];

  for (const [index, value] of invalidValues.entries()) {
    const inputPath = join(root, `invalid-${index}.json`);
    await writeFile(inputPath, fixtureBytes(value));
    await assert.rejects(prepareT3ThemeFile(inputPath), { code: 'INVALID_THEME' });
  }
});

test('input rejects symlinks and files above the 32 KiB contract limit', async () => {
  const root = await makeTempDirectory();
  const validPath = join(root, 'source.json');
  const aliasPath = join(root, 'alias.json');
  const oversizedPath = join(root, 'oversized.json');
  await writeFile(validPath, fixtureBytes());
  await symlink(validPath, aliasPath);
  await writeFile(oversizedPath, Buffer.alloc(MAX_T3_THEME_FILE_BYTES + 1, 0x20));

  await assert.rejects(prepareT3ThemeFile(aliasPath), { code: 'SYMLINK' });
  await assert.rejects(prepareT3ThemeFile(oversizedPath), { code: 'TOO_LARGE' });
});

test('apply requires the exact reviewed SHA-256 before staging or discovering an app', async () => {
  const root = await makeTempDirectory();
  const inputPath = join(root, 'reviewed-theme.json');
  await writeFile(inputPath, fixtureBytes());

  await assert.rejects(
    applyT3Theme({ inputPath, expectedSha256: '0'.repeat(64) }),
    { code: 'HASH_MISMATCH' },
  );
});

test('a prepared file changed after review fails the exact-hash gate', async () => {
  const root = await makeTempDirectory();
  const inputPath = join(root, 'reviewed-theme.json');
  await writeFile(inputPath, fixtureBytes());
  const prepared = await prepareT3ThemeFile(inputPath);
  await writeFile(prepared.stagedInputPath, fixtureBytes({ ...fixtureValue(), name: 'Changed after review' }));

  await assert.rejects(
    applyPreparedT3Theme(prepared, prepared.inputHash),
    { code: 'HASH_MISMATCH' },
  );
});

test('command arguments pin theme set, the default base directory, the content ID, and the private stage path', () => {
  const inputHash = 'ab'.repeat(32);
  const themeId = deriveT3ThemeId(inputHash);
  const args = buildT3ThemeSetArguments({
    baseDirectory: '/Users/example/.t3',
    stagedInputPath: '/private/tmp/dexthemes-stage/theme.json',
    themeId,
  });

  assert.deepEqual(args, [
    'theme', 'set', '--base-dir', '/Users/example/.t3', '--id', themeId,
    '/private/tmp/dexthemes-stage/theme.json',
  ]);
  assert.throws(() => buildT3ThemeSetArguments({
    baseDirectory: '/Users/example/.t3',
    stagedInputPath: '/private/tmp/theme.json',
    themeId: '--help',
  }), /Theme ID/);
});

test('default state inspection rejects symlinked userdata and themes paths', async (t) => {
  await t.test('userdata symlink', async () => {
    const home = await makeTempDirectory();
    const outside = await makeTempDirectory();
    const paths = getDefaultT3StatePaths(home);
    await mkdir(paths.baseDirectory);
    await symlink(outside, paths.stateDirectory);
    await assert.rejects(inspectT3DefaultState(home), { code: 'SYMLINK' });
  });

  await t.test('themes symlink', async () => {
    const home = await makeTempDirectory();
    const outside = await makeTempDirectory();
    const paths = getDefaultT3StatePaths(home);
    await mkdir(paths.stateDirectory, { recursive: true });
    await symlink(outside, paths.themesDirectory);
    await assert.rejects(inspectT3DefaultState(home), { code: 'SYMLINK' });
  });
});

test('destination inspection permits the exact existing bytes and blocks overwrite or symlink targets', async (t) => {
  const root = await makeTempDirectory();
  const themesDirectory = join(root, 'themes');
  await mkdir(themesDirectory);
  const bytes = fixtureBytes();
  const inputHash = hash(bytes);
  const themeId = deriveT3ThemeId(inputHash);
  const destination = join(themesDirectory, `${themeId}.json`);

  assert.equal((await inspectT3ThemeDestination(themesDirectory, themeId, inputHash)).exists, false);
  await writeFile(destination, bytes);
  assert.deepEqual(await inspectT3ThemeDestination(themesDirectory, themeId, inputHash), {
    destinationPath: destination,
    exists: true,
    publishedHash: inputHash,
  });

  await writeFile(destination, fixtureBytes({ ...fixtureValue(), name: 'Different bytes' }));
  await assert.rejects(
    inspectT3ThemeDestination(themesDirectory, themeId, inputHash),
    { code: 'DESTINATION_CONFLICT' },
  );

  const linkDirectory = join(root, 'linked-themes');
  await symlink(themesDirectory, linkDirectory);
  await assert.rejects(
    inspectT3ThemeDestination(linkDirectory, themeId, inputHash),
    { code: 'SYMLINK' },
  );

  const symlinkFileDirectory = join(root, 'symlink-file-themes');
  const externalPath = join(root, 'outside-theme.json');
  await mkdir(symlinkFileDirectory);
  await writeFile(externalPath, bytes);
  await symlink(externalPath, join(symlinkFileDirectory, `${themeId}.json`));
  await assert.rejects(
    inspectT3ThemeDestination(symlinkFileDirectory, themeId, inputHash),
    { code: 'SYMLINK' },
  );
});
