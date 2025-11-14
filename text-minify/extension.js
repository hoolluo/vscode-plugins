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

        // 读取用户配置
        const config = vscode.workspace.getConfiguration('textMinify');
        const suffix = config.get('suffix', 'min');           // 默认 min
        const dropConsole = config.get('dropConsole', false); // 默认 false

        try {
            let result = '';

            // JS
            if (ext === '.js') {
                result = (await Terser.minify(code, {
                    compress: {
                        drop_console: dropConsole
                    }
                })).code;
            }
            // CSS
            else if (ext === '.css') {
                result = new CleanCSS().minify(code).styles;
            }
            // JSON
            else if (ext === '.json') {
                result = JSON.stringify(JSON.parse(code));
            }
            else {
                vscode.window.showErrorMessage('Only JS/CSS/JSON files are supported!');
                return;
            }

            // 输出文件名
            const minFile = doc.fileName.replace(ext, `.${suffix}${ext}`);
            fs.writeFileSync(minFile, result, 'utf8');
            vscode.window.showInformationMessage(`Minified file saved: ${minFile}`);

        } catch (err) {
            vscode.window.showErrorMessage(err.message);
        }
    });

    // 监听保存自动生成
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
