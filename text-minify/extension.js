const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const Terser = require('terser');
const CleanCSS = require('clean-css');
const JavaScriptObfuscator = require('javascript-obfuscator');
const CryptoJS = require('crypto-js');

function activate(context) {
    console.log('Text Minify extension is now active!');

    // 压缩 JS/CSS
    const minifyCmd = vscode.commands.registerCommand('text-minify.minify', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) return;

        const doc = editor.document;
        const code = doc.getText();
        const ext = path.extname(doc.fileName);

        try {
            let result = '';
            if (ext === '.js') {
                result = (await Terser.minify(code)).code;
            } else if (ext === '.css') {
                result = new CleanCSS().minify(code).styles;
            } else {
                vscode.window.showErrorMessage('Only JS/CSS files are supported!');
                return;
            }

            const minFile = doc.fileName.replace(ext, `.min${ext}`);
            fs.writeFileSync(minFile, result, 'utf8');
            vscode.window.showInformationMessage(`Minified file saved: ${minFile}`);
        } catch (err) {
            vscode.window.showErrorMessage(err.message);
        }
    });

    // JS AES 加密
    const encryptCmd = vscode.commands.registerCommand('text-minify.encrypt', () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) return;

        const doc = editor.document;
        const code = doc.getText();
        const encrypted = CryptoJS.AES.encrypt(code, 'secret-key').toString();

        const encFile = doc.fileName.replace(/\.js$/, '.enc.js');
        fs.writeFileSync(encFile, encrypted, 'utf8');
        vscode.window.showInformationMessage(`Encrypted file saved: ${encFile}`);
    });

    // JS 混淆
    const obfuscateCmd = vscode.commands.registerCommand('text-minify.obfuscate', () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) return;

        const doc = editor.document;
        const code = doc.getText();
        const obfuscated = JavaScriptObfuscator.obfuscate(code, {
            compact: true,
            controlFlowFlattening: true
        }).getObfuscatedCode();

        const obFile = doc.fileName.replace(/\.js$/, '.obf.js');
        fs.writeFileSync(obFile, obfuscated, 'utf8');
        vscode.window.showInformationMessage(`Obfuscated file saved: ${obFile}`);
    });

    // 自动保存生成 .min.js/.min.css
    vscode.workspace.onDidSaveTextDocument((doc) => {
        const ext = path.extname(doc.fileName);
        if (ext === '.js' || ext === '.css') {
            vscode.commands.executeCommand('text-minify.minify');
        }
    });

    context.subscriptions.push(minifyCmd, encryptCmd, obfuscateCmd);
}

function deactivate() {}

module.exports = { activate, deactivate };
