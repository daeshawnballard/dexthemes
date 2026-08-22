'use strict';

const vscode = require('vscode');
const {
  APPLIED_THEME,
  applyTheme,
  revertTheme,
} = require('./src/theme-controller');

function cursorThemeBridge(context) {
  return {
    getTheme() {
      return vscode.workspace.getConfiguration('workbench').get('colorTheme');
    },
    setTheme(themeName) {
      return vscode.workspace
        .getConfiguration('workbench')
        .update('colorTheme', themeName, vscode.ConfigurationTarget.Global);
    },
    state: context.globalState,
  };
}

function activate(context) {
  context.subscriptions.push(
    vscode.commands.registerCommand('dexthemes.applyNocturnalVigil', async () => {
      try {
        const result = await applyTheme(cursorThemeBridge(context));
        await vscode.window.showInformationMessage(
          `${APPLIED_THEME} applied. Run “DexThemes: Revert Previous Theme” to restore ${result.previousTheme}.`,
        );
      } catch (error) {
        await vscode.window.showErrorMessage(`DexThemes could not apply the theme: ${error.message}`);
        throw error;
      }
    }),
    vscode.commands.registerCommand('dexthemes.revertTheme', async () => {
      try {
        const result = await revertTheme(cursorThemeBridge(context));
        await vscode.window.showInformationMessage(`DexThemes restored ${result.restoredTheme}.`);
      } catch (error) {
        await vscode.window.showErrorMessage(`DexThemes could not revert the theme: ${error.message}`);
        throw error;
      }
    }),
  );
}

function deactivate() {}

module.exports = { activate, deactivate };
