import moteur from '../moteur.js';
import { DocumentValidator } from './DocumentValidator.js';

/**
 * Service d'orchestration de l'analyse SOLID.
 * Responsabilité : Coordonner la lecture du document et l'appel au moteur d'analyse.
 */
export class AnalysisService {
    /**
     * Analyse un document VS Code.
     * @param {vscode.TextDocument} document 
     * @returns {Promise<Array>} Liste des violations
     */
    async analyze(document) {
        if (!DocumentValidator.isSupported(document)) {
            return [];
        }

        console.log(`[SOLID-Check] Analyse de ${document.fileName}...`);

        try {
            const content = document.getText();
            const violations = await moteur.analyser(document.fileName, content);
            console.log(`[SOLID-Check] ${violations.length} violations détectées.`);
            return violations;
        } catch (error) {
            console.error('[SOLID-Check] Erreur lors de l\'analyse:', error);
            throw error;
        }
    }
}
