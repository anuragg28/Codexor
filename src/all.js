const vscode = require('vscode'); // ✅ Required

// 🧠 Mock Translator Function
function mockTranslate(code, targetLang) {
    const lang = targetLang.toLowerCase();

    if (lang === 'python') {
        return code
            .replace(/console\.log\((.*?)\);?/g, 'print($1)')
            .replace(/System\.out\.println\((.*?)\);?/g, 'print($1)')
            .replace(/std::cout << (.*?) << std::endl;/g, 'print($1)')
            .replace(/;/g, '');
    }

    if (lang === 'javascript') {
        if (/print\((.*?)\)/.test(code)) {
            return code.replace(/print\((.*?)\)/g, 'console.log($1);');
        } else if (/System\.out\.println/.test(code)) {
            return code.replace(/System\.out\.println\((.*?)\);?/g, 'console.log($1);');
        } else if (/std::cout << (.*?) << std::endl;/.test(code)) {
            const match = code.match(/std::cout << (.*?) << std::endl;/);
            return match ? `console.log(${match[1]});` : '// Could not parse';
        }
    }

    if (lang === 'java') {
        if (/console\.log/.test(code)) {
            return code.replace(/console\.log\((.*?)\);?/g, 'System.out.println($1);');
        } else if (/print\((.*?)\)/.test(code)) {
            return code.replace(/print\((.*?)\)/g, 'System.out.println($1);');
        }
    }

    if (lang === 'c++' || lang === 'cpp') {
        if (/console\.log/.test(code)) {
            return code.replace(/console\.log\((.*?)\)/g, 'std::cout << $1 << std::endl;');
        } else if (/print\((.*?)\)/.test(code)) {
            return code.replace(/print\((.*?)\)/g, 'std::cout << $1 << std::endl;');
        }
    }

    return `// [Translated to ${targetLang} - mock mode]\n// ${code}`;
}

function activate(context) {
    // 🔍 Autocompletion Provider
    const provider = vscode.languages.registerCompletionItemProvider(
        ['javascript', 'python', 'java'],
        {
            provideCompletionItems(document, position) {
                const linePrefix = document.lineAt(position).text.slice(0, position.character);
                const suggestions = [];

                if (linePrefix.endsWith('con')) {
                    suggestions.push(createSnippet('console.log($1);', 'console.log()', 'JS: Console log'));
                }

                if (linePrefix.endsWith('for')) {
                    suggestions.push(createSnippet('for i in range($1):\n\t$2', 'for loop', 'Python: For loop'));
                }

                if (linePrefix.endsWith('if')) {
                    suggestions.push(createSnippet('if ($1) {\n\t$2\n}', 'if statement', 'Java/JS: If block'));
                }

                return suggestions;
            }
        },
        '.' // optional: trigger when `.` is typed, or leave empty
    );

    context.subscriptions.push(provider);
}

function createSnippet(body, label, detail) {
    const item = new vscode.CompletionItem(label, vscode.CompletionItemKind.Snippet);
    item.insertText = new vscode.SnippetString(body);
    item.detail = detail;
    item.documentation = 'Auto suggestion by Codexor';
    return item;
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};
