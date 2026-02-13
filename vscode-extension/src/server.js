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

// Importations dynamiques pour le moteur SOLID-Check (ESM)
let AnalyseurFichier, AnalyseurTaille, DetecteurComplexite, AnalyseurDeCohesion, AnalyseurUniversel;
let engineInitialized = false;

/**
 * Initialise le moteur d'analyse
 */
async function initializeEngine() {
    if (engineInitialized) return;
    f
    try {
        // Importation dynamique des modules ESM depuis la copie locale dans l'extension
        const analyseurFichierPath = '../src-core/services/validateur/analyseur-fichier.js';
        const taillePath = '../src-core/services/analyseur-taille/index.js';
        const detecteurComplexitePath = '../src-core/services/detecteur-complexite/index.js';
        const cohesionPath = '../src-core/services/analyseur-cohesion/index.js';
        const universelPath = '../src-core/services/analyseur-universel/index.js';

        const [afModule, tailleModule, dcModule, cohesionModule, universelModule] = await Promise.all([
            import(analyseurFichierPath),
            import(taillePath),
            import(detecteurComplexitePath),
            import(cohesionPath),
            import(universelPath)
        ]);

        AnalyseurFichier = afModule.default;
        AnalyseurTaille = tailleModule.default;
        DetecteurComplexite = dcModule.default;
        AnalyseurDeCohesion = cohesionModule.default;
        AnalyseurUniversel = universelModule.default;

        engineInitialized = true;
        connection.console.log('SOLID-Check Engine initialized successfully in LSP server');
    } catch (error) {
        connection.console.error(`Failed to initialize SOLID-Check Engine: ${error.stack}`);
    }
}

// Analyse lors du changement de contenu ou sauvegarde
documents.onDidChangeContent(async (change) => {
    await validateTextDocument(change.document);
});

documents.onDidSave(async (change) => {
    await validateTextDocument(change.document);
});

// Logique de validation
async function validateTextDocument(textDocument) {
    if (!engineInitialized) {
        await initializeEngine();
    }

    if (!engineInitialized) return;

    try {
        const diagnostics = [];
        const content = textDocument.getText();
        const lines = content.split(/\r?\n/g);

        // Configuration par défaut (similaire à regles.default.json)
        const configuration = {
            limites: { lignesParFichier: 300, methodesParClasse: 15, parametresParFonction: 5 },
            complexite: { motsClésMaximum: 20, niveauxImbrication: 4 },
            cohesion: { scoreMinimumdeCohesion: 60, limiteLignesParFonction: 50, limiteProprietesNonCohesives: 5, limiteCategoriesVerbes: 4 },
            regles: { verifierTailleFichiers: true, verifierComplexite: true, verifierCohesion: true, verifierNommage: true },
            messages: {
                fichierTropGrand: "Le fichier '{fichier}' contient {lignes} lignes (limite: {limite})",
                complexiteTropElevee: "Complexité trop élevée dans '{fichier}': {raison}"
            }
        };

        // Instanciation des analyseurs (même liste que dans src/index.js)
        const analyseurs = [
            new AnalyseurUniversel(),
            new AnalyseurTaille(),
            new DetecteurComplexite(), // DetecteurComplexite est l'analyseur lui-même
            new AnalyseurDeCohesion()
        ];

        const analyseurFichier = new AnalyseurFichier(analyseurs, configuration);

        const donneesFichier = {
            chemin: textDocument.uri,
            contenu: content,
            nombreLignes: lines.length
        };

        const rapport = await analyseurFichier.analyser(donneesFichier);

        // Parcourir les résultats de chaque analyseur
        if (rapport && rapport.analyseurs) {
            rapport.analyseurs.forEach(resultatAnalyseur => {
                if (resultatAnalyseur.violations) {
                    resultatAnalyseur.violations.forEach(violation => {
                        // Déterminer la sévérité
                        let severity = DiagnosticSeverity.Warning;
                        if (violation.gravite === 'ERREUR') {
                            severity = DiagnosticSeverity.Error;
                        }

                        // Déterminer la ligne (0-indexed)
                        let line = 0;
                        if (violation.ligne !== undefined) {
                            line = Math.max(0, violation.ligne - 1);
                        } else if (violation.details && violation.details.ligne !== undefined) {
                            line = Math.max(0, violation.details.ligne - 1);
                        }

                        // Déterminer le message
                        let message = violation.message;
                        // Si c'est une violation de SRP détaillée, on l'affiche telle quelle
                        // Sinon on préfixe par le nom de l'analyseur si utile

                        // Tronquer la ligne au besoin
                        const characterEnd = lines[line] ? lines[line].length : Number.MAX_VALUE;

                        diagnostics.push({
                            severity: severity,
                            range: {
                                start: { line: line, character: 0 },
                                end: { line: line, character: characterEnd }
                            },
                            message: `[SOLID-Check] ${message}`,
                            source: 'SOLID-Check',
                            code: violation.type
                        });
                    });
                }
            });
        }

        // Envoi des diagnostics à VS Code
        connection.sendDiagnostics({ uri: textDocument.uri, diagnostics });
    } catch (error) {
        connection.console.error(`Validation error: ${error.stack}`);
    }
}

// Gestion des changements de configuration
connection.onDidChangeConfiguration(change => {
    documents.all().forEach(validateTextDocument);
});

// Écoute des documents
documents.listen(connection);
connection.listen();
