---
name: restore-vscode-config
description: 在新 Windows 机器上导入 VS-Code-Setting 仓库中的 VS Code 用户设置、快捷键、VSCodeVim 映射、扩展清单和本地 IME Pane Switch。用于迁移或补齐这套配置。
---

# 在新机器导入 VS Code 配置

## 确定来源和目标

1. 获取完整的 [VS-Code-Setting 仓库](https://github.com/xiabinyu/VS-Code-Setting)。从仓库根目录读取 `vscode-config/settings.json`、`vscode-config/keybindings.json` 和 `vscode-config/extensions.txt`。根目录的 `package.json` 和 `extension.js` 是本地 IME Pane Switch 扩展。
2. 在目标 VS Code 窗口切到要配置的 Profile。分别运行 `Preferences: Open User Settings (JSON)` 和 `Preferences: Open Keyboard Shortcuts (JSON)`，通过打开的文件确认目标。标准 Windows 默认 Profile 使用 `%APPDATA%\Code\User` 下的两个 JSON 文件。命名 Profile 以界面打开的文件为准。[VS Code 用户设置](https://code.visualstudio.com/docs/configure/settings)
3. 备份目标文件。全新 Profile 可以用仓库文件作为底稿。已有 Profile 按下面的步骤合并，保留独有的设置和快捷键。

## 安装扩展和输入法

1. 在 Windows 添加英语（美国）和简体中文微软拼音。按上游说明下载对应架构的 `im-select.exe`，放到 `C:\Bin\im-select.exe`，或记下实际路径。仓库的默认输入法 ID 是英文 `1033`、中文 `2052`。[im-select](https://github.com/daipeihust/im-select)
2. 在目标 Profile 安装 `extensions.txt` 中缺少的 Marketplace 扩展，包括 `vscodevim.vim`。可在扩展视图按 ID 安装，或从仓库根目录运行下面的 PowerShell 命令。命名 Profile 在两处 `code` 调用中都加上 `--profile "实际 Profile 名称"`。[VS Code 扩展安装](https://code.visualstudio.com/docs/configure/extensions/extension-marketplace)

   ```powershell
   $installed = code --list-extensions
   if ($LASTEXITCODE -ne 0) { throw '无法读取已安装扩展' }
   Get-Content -LiteralPath 'vscode-config/extensions.txt' | ForEach-Object {
       $extensionId = $_.Trim()
       if ($extensionId -and $extensionId -ne 'local.ime-pane-switch' -and $extensionId -notin $installed) {
           code --install-extension $extensionId
           if ($LASTEXITCODE -ne 0) { Write-Warning "安装失败: $extensionId" }
       }
   }
   ```

3. 安装 `local.ime-pane-switch` 时，在目标窗口执行 `Developer: Install Extension from Location...` 并选择仓库根目录。需要命令行安装时，把 `package.json`、`extension.js`、`README.md` 复制到一个空的临时目录，在该目录运行 `npx --yes @vscode/vsce package --no-dependencies --allow-missing-repository --skip-license --out ime-pane-switch.vsix`，再用 `code --install-extension .\ime-pane-switch.vsix` 安装到目标 Profile。打包需要 Node.js 和 npm。[VS Code 扩展打包](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)
4. 在新机启用 Copilot Chat 并按需登录。LaTeX、MATLAB、IAR 等外部工具按实际使用情况单独安装，并调整相应路径。

## 合并用户配置

- `settings.json` 按顶层设置键合并。对比已有值再处理不同的设置，保留本机独有项。Vim 的 `vim.leader`、`vim.*KeyBindings*` 都从这份文件迁移。Leader 为 `<space>`，检查 Normal、Visual、Insert 三组映射是否齐全。若已有同模式映射，按 `before` 键序列合并，保留本地独有的映射。
- 让 IME Pane Switch 负责切换。确认 `imePaneSwitch.enable` 为 `true`、`vim.autoSwitchInputMethod.enable` 为 `false`。如果 `im-select.exe` 放在其他路径，将 `imePaneSwitch.switchIMCmd` 改为实际命令，保留 `{im}`，可执行文件路径有空格时加引号，并按 JSON 格式转义。
- `keybindings.json` 按完整规则合并并去重，保留 `command`、`args`、`when` 和以 `-` 开头的解绑规则。保留各来源的相对顺序，检查相同按键且 `when` 重叠的规则，避免改变既有优先级。
- 核对机器相关项，如代理、UNC 主机、工具安装目录。`chat.tools.terminal.autoApprove` 中指向旧机器路径的规则留给当前机器单独配置。
- 两份文件都是 JSONC。用支持注释和尾逗号的工具编辑，写入前校验语法，并列出需要用户决定的实际冲突。

## 验证导入

1. 通过目标 Profile 的扩展视图或 `code --list-extensions` 核对 `vscodevim.vim`、`local.ime-pane-switch` 和其余清单，报告安装失败的项。需要时在目标窗口执行 `Developer: Reload Window`。
2. 按 `Ctrl+P` 打开 Quick Open，检查 `Ctrl+J` 向下、`Ctrl+K` 向上。在 Vim 中试用 Insert 模式的 `jj` 和 Normal 模式的 `Space p`，再核对 Visual 模式映射。
3. 检查 `Ctrl+Alt+C` 打开 Copilot Chat 并切中文，`Ctrl+Alt+E` 回编辑器、`Ctrl+Alt+T` 进终端并切英文。`Ctrl+W` 后接 `H/J/K/L` 的窗格导航规则在编辑器文本区以外生效。
4. 如果按键无效，先在目标窗口重新打开两份用户 JSON 确认 Profile，再核对扩展状态、快捷键的 `when` 条件和 `im-select.exe` 路径。只验证到文件或扩展清单时，说明界面按键尚未实测。
