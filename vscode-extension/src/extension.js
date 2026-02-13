import * as vscode from 'vscode';
import {
    AnalysisService,
    DiagnosticService,
    AIOrchestratorService,
    NotificationService,
    DocumentValidator
} from './services/index.js';
import { CommandRegistry } from './commands/CommandRegistry.js';
import { AIAssistantIntegration } from './ai-assistant-integration.js';
import { RefactoringCodeActionProvider } from './refactoring-provider.js';

/**
 * Point d'entrée de l'extension SOLID-Check.
 * Responsabilité : Gérer le cycle de vie de l'extension et coordonner les services.
 */

let analysisService;
let diagnosticService;
let aiOrchestrator;
let aiAssistant;

/**
 * @param {vscode.ExtensionContext} context
 */
export async function activate(context) {
    console.log('[SOLID-Check] Activation de l\'extension...');

    // Initialisation des services
    analysisService = new AnalysisService();
    diagnosticService = new DiagnosticService();
    aiOrchestrator = new AIOrchestratorService(context.extensionPath);
    aiAssistant = new AIAssistantIntegration();

    context.subscriptions.push(diagnosticService);

    // Initialisation de l'assistant IA
    aiAssistant.init(context.extensionPath).catch(err => {
        console.error('[SOLID-Check] Échec init assistant IA:', err);
    });

    // Enregistrement des commandes
    CommandRegistry.registerCommands(context, {
        analysisService,
        diagnosticService,
        aiOrchestrator,
        aiAssistant
    });

    // Enregistrement des fournisseurs d'actions de code
    context.subscriptions.push(
        vscode.languages.registerCodeActionsProvider(
            DocumentValidator.SUPPORTED_LANGUAGES.map(lang => ({ language: lang, scheme: 'file' })),
            new RefactoringCodeActionProvider(),
            {
                providedCodeActionKinds: [vscode.CodeActionKind.QuickFix, vscode.CodeActionKind.RefactorRewrite]
            }
        )
    );

    // Événements du workspace
    context.subscriptions.push(
        vscode.workspace.onDidOpenTextDocument(doc => triggerAnalysis(doc)),
        vscode.workspace.onDidChangeTextDocument(e => triggerAnalysis(e.document)),
        vscode.workspace.onDidCloseTextDocument(doc => diagnosticService.clearDiagnostics(doc.uri))
    );

    // Analyse initiale si un fichier est ouvert
    if (vscode.window.activeTextEditor) {
        triggerAnalysis(vscode.window.activeTextEditor.document);
    }

    console.log('[SOLID-Check] Extension active.');
}

/**
 * Déclenche l'analyse d'un document.
 * @param {vscode.TextDocument} document 
 */
async function triggerAnalysis(document) {
    try {
        const violations = await analysisService.analyze(document);
        diagnosticService.updateDiagnostics(document.uri, violations);
    } catch (error) {
        console.error('[SOLID-Check] Erreur analyse:', error);
    }
}

export function deactivate() {
    console.log('[SOLID-Check] Extension désactivée.');
}
