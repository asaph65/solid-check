/**
 * Validateur de documents pour l'analyse SOLID.
 * Responsabilité : Déterminer si un fichier doit être analysé.
 */
export class DocumentValidator {
    static SUPPORTED_LANGUAGES = [
        'javascript',
        'typescript',
        'python',
        'java',
        'csharp',
        'php',
        'javascriptreact',
        'typescriptreact'
    ];

    /**
     * Vérifie si le document est supporté par l'analyseur.
     * @param {vscode.TextDocument} document 
     * @returns {boolean}
     */
    static isSupported(document) {
        if (!document) return false;
        return this.SUPPORTED_LANGUAGES.includes(document.languageId);
    }
}
