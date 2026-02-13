import * as vscode from 'vscode';

/**
 * Fournisseur d'Actions de Code pour la refactorisation IA (SOLID)
 */
export class RefactoringCodeActionProvider {
    provideCodeActions(document, range, context) {
        // On ne propose l'action que s'il y a des diagnostics de solid-check
        const diagnostics = context.diagnostics.filter(
            d => d.source === 'SOLID-Check'
        );

        if (diagnostics.length === 0) return [];

        const actionAssistant = new vscode.CodeAction(
            '⚡ Refactoriser avec votre Agent IA (Copilot, Cursor...)',
            vscode.CodeActionKind.QuickFix
        );

        actionAssistant.command = {
            command: 'solid-check.refactoriserAssistant',
            title: 'Refactoriser avec Assistant',
            arguments: [document, diagnostics, range]
        };

        actionAssistant.isPreferred = true;

        return [actionAssistant];
    }
}
