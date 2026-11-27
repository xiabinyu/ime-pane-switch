# IME Pane Switch

在同一个 VS Code 窗口里按窗格切换 Windows 输入法：编辑器/终端用英文，Copilot Chat 用中文。

## 新机器导入整套配置

参阅 [restore-vscode-config 技能](ai-skill/restore-vscode-config/SKILL.md)，或让 Codex 读取该文件并执行。技能覆盖 `vscode-config/` 中的用户设置、快捷键、VSCodeVim 映射、扩展清单，以及 IME Pane Switch 和 `im-select` 的安装与验证。

## 前置条件

1. 下载 [im-select](https://github.com/daipeihust/im-select)，放到 `C:\bin\im-select.exe`（不在该位置时，修改 `imePaneSwitch.switchIMCmd`）。
2. 关闭 VSCodeVim 的 `vim.autoSwitchInputMethod.enable`，由本扩展统一切换输入法（见下文“与 VSCodeVim 的关系”）。

## 配置

```json
{
    "imePaneSwitch.enable": true,
    "imePaneSwitch.englishIM": "1033",
    "imePaneSwitch.chatIM": "2052",
    "imePaneSwitch.switchIMCmd": "C:\\bin\\im-select.exe {im}"
}
```

- `enable`：是否启用。
- `englishIM`：编辑器使用的输入法 ID（1033 为英文 US）。
- `chatIM`：Copilot Chat 使用的输入法 ID（2052 为中文简体，微软拼音）。
- `switchIMCmd`：切换输入法的命令，`{im}` 会被替换为输入法 ID。

## 安装（不需要打包）

1. 按 `Ctrl+Shift+P`，运行 `Developer: Install Extension from Location...`，选择本目录。
2. 重启 VS Code。

## 快捷键示例（keybindings.json）

```json
[
  { "key": "ctrl+alt+c", "command": "imePaneSwitch.toChat" },
  { "key": "ctrl+alt+e", "command": "imePaneSwitch.toEditor" },
  { "key": "ctrl+alt+t", "command": "imePaneSwitch.toTerminal" },
  { "key": "ctrl+w h", "command": "imePaneSwitch.navigate", "args": { "command": "workbench.action.navigateLeft", "im": "1033" }, "when": "!editorTextFocus" },
  { "key": "ctrl+w j", "command": "imePaneSwitch.navigate", "args": { "command": "workbench.action.navigateDown", "im": "1033" }, "when": "!editorTextFocus" },
  { "key": "ctrl+w k", "command": "imePaneSwitch.navigate", "args": { "command": "workbench.action.navigateUp", "im": "1033" }, "when": "!editorTextFocus" },
  { "key": "ctrl+w l", "command": "imePaneSwitch.navigate", "args": { "command": "workbench.action.navigateRight", "im": "1033" }, "when": "!editorTextFocus" }
]
```

- `imePaneSwitch.navigate`：先执行 `args.command`（焦点移动），再切换到 `args.im`（默认 `englishIM`）。
- 用于 `navigate` 的导航键要把 `im` 设为目标窗格的输入法：移到编辑器用 `1033`；如果要移到 Chat，请改用 `imePaneSwitch.toChat`。


## 行为

- 运行 `IME: Focus Chat Input (Chinese)`：打开并聚焦 Chat 输入框，再切换为 `chatIM`。
- 运行 `IME: Focus Editor (English)`：切换为 `englishIM`，并把焦点移到编辑器。
- 用鼠标点击编辑器、或切换到其他编辑器标签页时：切换为 `englishIM`。
- 不区分 VSCodeVim 的模式，进入编辑器一律是英文（包括 Insert 模式）。

## 与 VSCodeVim 的关系

- 使用这个扩展时，请关闭 VSCodeVim 的 `vim.autoSwitchInputMethod.enable`，否则两边会互相切换。

## 限制

- VS Code 没有公开的“Chat 窗格获得焦点”事件，所以鼠标点击 Chat 输入框不会自动切中文，需要用快捷键命令进入 Chat。
- 鼠标事件依赖光标选区变化。只点击而不移动光标的情况不会触发切换。
