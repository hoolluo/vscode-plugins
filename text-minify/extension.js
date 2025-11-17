const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const Terser = require('terser');
const CleanCSS = require('clean-css');

function activate(context) {
    console.log('Text Minify extension is now active!');

    const minifyCmd = vscode.commands.registerCommand('text-minify.minify', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) return;

        const doc = editor.document;
        const code = doc.getText();
        const ext = path.extname(doc.fileName);

        // 用户配置
        const config = vscode.workspace.getConfiguration('textMinify');
        const suffix = config.get('suffix', 'min');
        const dropConsole = config.get('dropConsole', false);

        try {
            let result = '';

            if (ext === '.js') {
                // 仅使用 Terser 压缩（无混淆）
                result = (await Terser.minify(code, {
                    compress: { drop_console: dropConsole },
                    mangle: false
                })).code;

            } else if (ext === '.css') {
                result = new CleanCSS().minify(code).styles;

            } else if (ext === '.json') {
                result = JSON.stringify(JSON.parse(code));
            } else {
                vscode.window.showErrorMessage('Only JS/CSS/JSON files are supported!');
                return;
            }

            const minFile = doc.fileName.replace(ext, `.${suffix}${ext}`);
            fs.writeFileSync(minFile, result, 'utf8');
            vscode.window.showInformationMessage(`Minified file saved: ${minFile}`);
        } catch (err) {
            vscode.window.showErrorMessage(err.message);
        }
    });

    // 保存自动触发
    vscode.workspace.onDidSaveTextDocument((doc) => {
        const ext = path.extname(doc.fileName);
        if (ext === '.js' || ext === '.css' || ext === '.json') {
            vscode.commands.executeCommand('text-minify.minify');
        }
    });

    context.subscriptions.push(minifyCmd);
}

function deactivate() {}

module.exports = { activate, deactivate };
