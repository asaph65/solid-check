import * as vscode from 'vscode';

/**
 * Service de gestion des notifications et interactions utilisateur.
 * Responsabilité : Centraliser les affichages de messages et de progression.
 */
export class NotificationService {
    /**
     * Affiche un message d'information.
     * @param {string} message 
     */
    static showInfo(message) {
        vscode.window.showInformationMessage(message);
    }

    /**
     * Affiche un message d'erreur.
     * @param {string} message 
     */
    static showError(message) {
        vscode.window.showErrorMessage(message);
    }

    /**
     * Affiche un message d'avertissement.
     * @param {string} message 
     */
    static showWarning(message) {
        vscode.window.showWarningMessage(message);
    }

    /**
     * Exécute une tâche avec une barre de progression.
     * @param {string} title 
     * @param {Function} task 
     * @returns {Promise<any>}
     */
    static async withProgress(title, task) {
        return vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: title,
            cancellable: false
        }, task);
    }

    /**
     * Affiche un sélecteur de choix à l'utilisateur.
     * @param {string} message 
     * @param {string[]} choices 
     * @returns {Promise<string | undefined>}
     */
    static async showPicker(message, choices) {
        return vscode.window.showInformationMessage(message, ...choices);
    }

    /**
     * Demande confirmation pour appliquer une refactorisation.
     * @param {string} strategy 
     * @param {number} fileCount 
     * @returns {Promise<string | undefined>}
     */
    static async confirmRefactoring(strategy, fileCount) {
        return vscode.window.showInformationMessage(
            `Refactorisation proposée : ${strategy}\n\nFichiers impactés : ${fileCount}`,
            'Appliquer', 'Voir le code', 'Annuler'
        );
    }

    /**
     * Affiche un aperçu du code refactorisé.
     * @param {Array} files 
     */
    static async showPreview(files) {
        const previewContent = files.map(f =>
            `// ${f.path}\n// ${f.purpose || ''}\n\n${f.content}`
        ).join('\n\n' + '='.repeat(40) + '\n\n');

        const doc = await vscode.workspace.openTextDocument({
            content: previewContent,
            language: 'javascript'
        });
        await vscode.window.showTextDocument(doc);
    }
}
