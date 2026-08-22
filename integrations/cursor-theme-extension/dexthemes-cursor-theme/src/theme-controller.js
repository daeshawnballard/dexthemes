'use strict';

const APPLIED_THEME = 'DexThemes Nocturnal Vigil Dark';
const PREVIOUS_THEME_KEY = 'dexthemes.cursor.previousColorTheme';

function assertThemeName(value, label) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new TypeError(`${label} must be a non-empty string.`);
  }
  return value;
}

async function applyTheme({ getTheme, setTheme, state }) {
  const currentTheme = assertThemeName(await getTheme(), 'Current Cursor theme');

  if (currentTheme !== APPLIED_THEME) {
    await state.update(PREVIOUS_THEME_KEY, currentTheme);
  }

  await setTheme(APPLIED_THEME);
  const effectiveTheme = assertThemeName(await getTheme(), 'Effective Cursor theme');
  if (effectiveTheme !== APPLIED_THEME) {
    throw new Error(`Cursor reported ${effectiveTheme} after DexThemes apply.`);
  }

  return { previousTheme: currentTheme, appliedTheme: effectiveTheme };
}

async function revertTheme({ getTheme, setTheme, state }) {
  const previousTheme = state.get(PREVIOUS_THEME_KEY);
  assertThemeName(previousTheme, 'Stored previous Cursor theme');

  await setTheme(previousTheme);
  const effectiveTheme = assertThemeName(await getTheme(), 'Effective Cursor theme');
  if (effectiveTheme !== previousTheme) {
    throw new Error(`Cursor reported ${effectiveTheme} after DexThemes revert.`);
  }

  await state.update(PREVIOUS_THEME_KEY, undefined);
  return { restoredTheme: effectiveTheme };
}

module.exports = {
  APPLIED_THEME,
  PREVIOUS_THEME_KEY,
  applyTheme,
  revertTheme,
};
