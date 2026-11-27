const vscode = require('vscode');
const { exec } = require('child_process');

function cfg() {
  return vscode.workspace.getConfiguration('imePaneSwitch');
}

function switchIM(imId) {
  const c = cfg();
  if (!c.get('enable')) {
    return Promise.resolve();
  }
  const cmd = c.get('switchIMCmd').replace('{im}', imId);
  return new Promise((resolve) => {
    exec(cmd, (err) => {
      if (err) {
        vscode.window.showWarningMessage(`ime-pane-switch: 切换输入法失败: ${err.message}`);
      }
      resolve();
    });
  });
}

async function toEditor() {
  await switchIM(cfg().get('englishIM'));
  await vscode.commands.executeCommand('workbench.action.focusActiveEditorGroup');
}

async function toChat() {
  await vscode.commands.executeCommand('workbench.action.chat.open');
  await switchIM(cfg().get('chatIM'));
}

async function toTerminal() {
  await switchIM(cfg().get('englishIM'));
  await vscode.commands.executeCommand('workbench.action.terminal.focus');
}

async function navigate(args) {
  const command = typeof args === 'string' ? args : args?.command;
  const im = (typeof args === 'object' && args?.im) || cfg().get('englishIM');
  await vscode.commands.executeCommand(command);
  await switchIM(im);
}

function activate(context) {
  context.subscriptions.push(
    vscode.commands.registerCommand('imePaneSwitch.toEditor', toEditor),
    vscode.commands.registerCommand('imePaneSwitch.toChat', toChat),
    vscode.commands.registerCommand('imePaneSwitch.toTerminal', toTerminal),
    vscode.commands.registerCommand('imePaneSwitch.navigate', navigate),
    vscode.window.onDidChangeTextEditorSelection((e) => {
      if (e.kind === vscode.TextEditorSelectionChangeKind.Mouse) {
        switchIM(cfg().get('englishIM'));
      }
    }),
    vscode.window.onDidChangeActiveTextEditor((editor) => {
      if (editor) {
        switchIM(cfg().get('englishIM'));
      }
    }),
  );
}

function deactivate() {}

module.exports = { activate, deactivate };
