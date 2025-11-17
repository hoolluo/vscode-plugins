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
        const extRaw = path.extname(doc.fileName).toLowerCase();
        const ext = extRaw.replace('.', '');

        // 用户配置
        const config = vscode.workspace.getConfiguration('textMinify');
        const suffix = config.get('suffix', 'min');
        const dropConsole = config.get('dropConsole', false);
        const enabledExtensions = config.get('fileExtensions', {
            css: true,
            js: true,
            json: true
        });

        // 当前文件是否开启压缩
        if (!enabledExtensions[ext]) {
            vscode.window.showInformationMessage(`Minify for ".${ext}" files is disabled in settings.`);
            return;
        }

        try {
            let result = '';

            if (ext === 'js') {
                // JS 压缩
                result = (await Terser.minify(code, {
                    compress: { drop_console: dropConsole },
                    mangle: false
                })).code;

            } else if (ext === 'css') {
                // CSS 压缩
                result = new CleanCSS().minify(code).styles;

            } else if (ext === 'json') {
                // JSON 压缩
                result = JSON.stringify(JSON.parse(code));
            } else {
                vscode.window.showErrorMessage('Only JS/CSS/JSON files are supported!');
                return;
            }

            // 输出文件路径
            const minFile = doc.fileName.replace(extRaw, `.${suffix}${extRaw}`);

            fs.writeFileSync(minFile, result, 'utf8');
            vscode.window.showInformationMessage(`Minified file saved: ${minFile}`);
        } catch (err) {
            vscode.window.showErrorMessage(err.message);
        }
    });

    // 保存自动触发压缩
    vscode.workspace.onDidSaveTextDocument((doc) => {
        const ext = path.extname(doc.fileName).replace('.', '').toLowerCase();

        const config = vscode.workspace.getConfiguration('textMinify');
        const enabledExtensions = config.get('fileExtensions', {
            css: true,
            js: true,
            json: true
        });

        if (enabledExtensions[ext]) {
            vscode.commands.executeCommand('text-minify.minify');
        }
    });

    context.subscriptions.push(minifyCmd);
}

function deactivate() {}

module.exports = { activate, deactivate };
