import * as vscode from 'vscode';
import { NotificationService } from '../services/NotificationService.js';

/**
 * Registre de commandes pour l'extension.
 * Responsabilité : Enregistrer les commandes VS Code et déléguer aux services.
 */
export class CommandRegistry {
    /**
     * Enregistre toutes les commandes de l'extension.
     * @param {vscode.ExtensionContext} context 
     * @param {Object} services Les services nécessaires
     */
    static registerCommands(context, services) {
        const { analysisService, diagnosticService, aiOrchestrator, aiAssistant } = services;

        // Commande : Refactoriser avec SOLID-Check
        const refactorCmd = vscode.commands.registerCommand('solid-check.refactoriser', async (document, range) => {
            try {
                const diagnostic = diagnosticService.getDiagnosticAt(document.uri, range);
                const result = await aiOrchestrator.refactor(document, range, diagnostic);
                await CommandRegistry.handleRefactoring(document, range, result);
            } catch (error) {
                NotificationService.showError("Erreur lors de la refactorisation : " + error.message);
            }
        });

        // Commande : Refactoriser avec IA (SOLID)
        const refactorIACmd = vscode.commands.registerCommand('solid-check.refactoriserIA', async (document, diagnostics, range) => {
            try {
                const result = await aiOrchestrator.refactorWithCoreService(document, diagnostics);
                await CommandRegistry.handleRefactoring(document, range, result);
            } catch (error) {
                NotificationService.showError("Erreur refactorisation IA : " + error.message);
            }
        });

        // Commande : Refactoriser avec Assistant IA
        const assistantCmd = vscode.commands.registerCommand('solid-check.refactoriserAssistant', async (document, diagnostics, range) => {
            try {
                const analysis = {
                    code: document.getText(range),
                    violations: diagnostics.map(d => ({
                        type: d.code || 'VIOLATION_SRP',
                        message: d.message
                    })),
                    context: { fileName: document.fileName, type: 'Service' }
                };
                await aiAssistant.showAIAssistantPicker(analysis);
            } catch (error) {
                NotificationService.showError("Erreur assistant IA : " + error.message);
            }
        });

        context.subscriptions.push(refactorCmd, refactorIACmd, assistantCmd);
    }

    static async handleRefactoring(document, range, refactoring) {
        const choice = await NotificationService.confirmRefactoring(
            refactoring.strategy,
            refactoring.files.length
        );

        if (choice === 'Voir le code') {
            await NotificationService.showPreview(refactoring.files);
            // On redemande après l'aperçu ? Pour l'instant on s'arrête là car l'utilisateur peut relancer l'action.
        } else if (choice === 'Appliquer') {
            await CommandRegistry.applyFiles(refactoring.files, document, range);
        }
    }

    static async applyFiles(files, document, range) {
        const edit = new vscode.WorkspaceEdit();

        for (const file of files) {
            const isOriginalFile = file.path === document.fileName || file.path === document.uri.fsPath;
            const uri = vscode.Uri.file(file.path);

            if (isOriginalFile) {
                edit.replace(document.uri, range, file.content);
            } else {
                // Pour les nouveaux fichiers ou autres fichiers
                edit.createFile(uri, { overwrite: true, ignoreIfExists: false });
                edit.insert(uri, new vscode.Position(0, 0), file.content);
            }
        }

        const success = await vscode.workspace.applyEdit(edit);
        if (success) {
            NotificationService.showInfo(`✅ ${files.length} fichiers mis à jour.`);
        }
    }
}
