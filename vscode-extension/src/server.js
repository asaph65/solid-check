const {
    createConnection,
    TextDocuments,
    DiagnosticSeverity,
    ProposedFeatures,
    DidChangeConfigurationNotification,
    TextDocumentSyncKind
} = require('vscode-languageserver/node');
const { TextDocument } = require('vscode-languageserver-textdocument');

// Connexion au client VS Code
const connection = createConnection(ProposedFeatures.all);
const documents = new TextDocuments(TextDocument);

let hasConfigurationCapability = false;

connection.onInitialize((params) => {
    const capabilities = params.capabilities;
    hasConfigurationCapability = !!(
        capabilities.workspace && !!capabilities.workspace.configuration
    );

    return {
        capabilities: {
            textDocumentSync: TextDocumentSyncKind.Incremental,
            // Le serveur indique qu'il fournit des Code Actions (Quick Fixes)
            codeActionProvider: true
        }
    };
});

connection.onInitialized(() => {
    if (hasConfigurationCapability) {
        connection.client.register(DidChangeConfigurationNotification.type, undefined);
    }
});

// Analyse lors de la sauvegarde (selon demande utilisateur)
// Note: On pourrait aussi utiliser onDidChangeContent pour du live
documents.onDidSave(async (change) => {
    await validateTextDocument(change.document);
});

// Logique de validation
async function validateTextDocument(textDocument) {
    const diagnostics = [];
    const text = textDocument.getText();
    const lines = text.split(/\r?\n/g);

    // 1. Règle : Fichier trop long (> 100 lignes)
    if (lines.length > 100) {
        const diagnostic = {
            severity: DiagnosticSeverity.Warning, // Orange
            range: {
                start: { line: 0, character: 0 },
                end: { line: 0, character: Number.MAX_VALUE }
            },
            message: `[SOLID-Check] Fichier trop long (${lines.length} lignes). Limite: 100.`,
            source: 'SOLID-Check'
        };
        diagnostics.push(diagnostic);
    }

    // 2. Règle : Fonction trop longue (> 20 lignes) - Détection naïve pour la démo
    // Dans une vraie implémentation, on importerait le "AnalyseurUniversel" du projet parent
    // via 'import' dynamique ou un require relatif vers ../../src/services/...

    // Simulation simple pour la démo sans dépendances complexes de build
    let insideFunc = false;
    let funcStart = 0;

    // Regex simple pour détecter function/def/class
    const funcRegex = /(function|def|void|class)\s+([a-zA-Z0-9_]+)/;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (funcRegex.test(line)) {
            if (insideFunc && (i - funcStart) > 20) {
                // Fonction précédente trop longue
                diagnostics.push({
                    severity: DiagnosticSeverity.Error, // Rouge
                    range: {
                        start: { line: funcStart, character: 0 },
                        end: { line: funcStart, character: Number.MAX_VALUE }
                    },
                    message: `[SOLID-Check] Fonction trop longue (> 20 lignes). Violation SRP.`,
                    source: 'SOLID-Check'
                });
            }
            insideFunc = true;
            funcStart = i;
        }
        // Détection fin de bloc simplifiée (indentation ou accolade)
        if (line.trim() === '}' || (line.trim() === '' && insideFunc)) {
            // insideFunc = false; // Logique à affiner avec le parser universel
        }
    }

    // Envoi des diagnostics à VS Code
    connection.sendDiagnostics({ uri: textDocument.uri, diagnostics });
}

// Gestion des changements de configuration
connection.onDidChangeConfiguration(change => {
    documents.all().forEach(validateTextDocument);
});

// Écoute des documents
documents.listen(connection);
connection.listen();
