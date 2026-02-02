const path = require('path');
const { LanguageClient, TransportKind } = require('vscode-languageclient/node');
const vscode = require('vscode');

let client;

function activate(context) {
    // Le serveur est implémenté en Node.js
    const serverModule = context.asAbsolutePath(path.join('src', 'server.js'));

    // Options de debug pour le serveur
    const debugOptions = { execArgv: ['--nolazy', '--inspect=6009'] };

    const serverOptions = {
        run: { module: serverModule, transport: TransportKind.ipc },
        debug: { module: serverModule, transport: TransportKind.ipc, options: debugOptions }
    };

    // Options du client
    const clientOptions = {
        // Active le serveur pour les fichiers supportés
        documentSelector: [
            { scheme: 'file', language: 'javascript' },
            { scheme: 'file', language: 'typescript' },
            { scheme: 'file', language: 'python' },
            { scheme: 'file', language: 'java' },
            { scheme: 'file', language: 'csharp' },
            { scheme: 'file', language: 'php' }
        ],
        synchronize: {
            fileEvents: vscode.workspace.createFileSystemWatcher('**/.clientrc')
        }
    };

    // Création et démarrage du client
    client = new LanguageClient(
        'solidCheckServer',
        'SOLID-Check Server',
        serverOptions,
        clientOptions
    );

    client.start();

    // Enregistrement de la commande de Quick Fix (Refactoring)
    context.subscriptions.push(vscode.commands.registerCommand('solid-check.refactoriser', () => {
        vscode.window.showInformationMessage('Lancement du Refactoring IA...');
        // Ici, on appellerait le vrai module de refactoring via le serveur
    }));
}

function deactivate() {
    if (!client) {
        return undefined;
    }
    return client.stop();
}

module.exports = {
    activate,
    deactivate
};
