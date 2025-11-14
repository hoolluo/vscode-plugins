const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const Terser = require('terser');
const CleanCSS = require('clean-css');
const babel = require('@babel/core');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const generator = require('@babel/generator').default;

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
        const suffix = config.get('suffix', 'min');
        const dropConsole = config.get('dropConsole', false);
        const obfuscate = config.get('obfuscate', false);

        try {
            let result = '';

            if (ext === '.js') {
                let transformedCode = code;

                // 如果开启轻量混淆，使用 Babel 改函数参数名
                if (obfuscate) {
                    const ast = parser.parse(code, { sourceType: 'module' });
                    const paramMap = new Map();
                    let paramCounter = 0;

                    const getShortName = () => {
                        const letters = 'abcdefghijklmnopqrstuvwxyz';
                        let name = '';
                        let n = paramCounter++;
                        do {
                            name = letters[n % 26] + name;
                            n = Math.floor(n / 26);
                        } while (n > 0);
                        return name;
                    };

                    traverse(ast, {
                        Function(path) {
                            path.node.params.forEach(param => {
                                if (param.type === 'Identifier') {
                                    const shortName = getShortName();
                                    paramMap.set(param.name, shortName);
                                    param.name = shortName;
                                }
                            });
                        },
                        Identifier(path) {
                            if (paramMap.has(path.node.name) && path.isReferencedIdentifier()) {
                                path.node.name = paramMap.get(path.node.name);
                            }
                        }
                    });

                    transformedCode = generator(ast, { 
                        compact: true, 
                        jsescOption: { minimal: false } // 转义非 ASCII 字符
                    }).code;
                }

                // 最后用 Terser 压缩，保持函数参数已经被轻量混淆
                result = (await Terser.minify(transformedCode, {
                    compress: { drop_console: dropConsole },
                    mangle: false // 保留 Babel 生成的参数名
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

    // 自动保存触发压缩
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
