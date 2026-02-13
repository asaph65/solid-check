import * as vscode from 'vscode';

/**
 * Service de gestion des diagnostics (erreurs/soulignements).
 * Responsabilité : Traduire les violations du moteur en diagnostics VS Code.
 */
export class DiagnosticService {
    constructor() {
        this.collection = vscode.languages.createDiagnosticCollection('solidCheck');
    }

    /**
     * Met à jour les diagnostics pour un document donné.
     * @param {vscode.Uri} uri 
     * @param {Array} violations 
     */
    updateDiagnostics(uri, violations) {
        const diagnostics = violations.map(v => {
            const range = new vscode.Range(
                v.ligne - 1,
                v.colonne,
                v.ligne - 1,
                v.colonne + (v.longueur || 1)
            );

            const severity = v.gravite === 'ERREUR'
                ? vscode.DiagnosticSeverity.Error
                : vscode.DiagnosticSeverity.Warning;

            const diagnostic = new vscode.Diagnostic(range, v.message, severity);
            diagnostic.source = 'SOLID-Check';
            diagnostic.code = v.code;

            return diagnostic;
        });

        this.collection.set(uri, diagnostics);
    }

    /**
     * Supprime les diagnostics pour un document donné.
     * @param {vscode.Uri} uri 
     */
    clearDiagnostics(uri) {
        this.collection.delete(uri);
    }

    /**
     * Dispose de la collection de diagnostics.
     */
    dispose() {
        this.collection.dispose();
    }

    /**
     * Récupère le diagnostic à une position donnée.
     * @param {vscode.Uri} uri 
     * @param {vscode.Range} range 
     * @returns {vscode.Diagnostic | undefined}
     */
    getDiagnosticAt(uri, range) {
        const diagnostics = this.collection.get(uri);
        if (!diagnostics) return undefined;
        return diagnostics.find(d => d.range.isEqual(range));
    }
}
