import { trouverFinBloc } from './utilitaires.js';
import { MOTS_CLES_IGNORES } from './constantes.js';

class AnalyseurLignesFonctions {
    static LIMITE_LIGNES = 20;

    /**
     * Analyse le contenu pour détecter les fonctions trop longues
     * @param {string} contenu - Contenu du fichier
     * @returns {string[]} Liste des violations trouvées
     */
    analyser(contenu) {
        const violations = [];
        const regex = /(?:function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\([^)]*\)\s*{|([a-zA-Z_$][a-zA-Z0-9_$]*)\s*[:=]\s*(?:async\s+)?function\s*\([^)]*\)\s*{|([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\([^)]*\)\s*(?:=>)?\s*{)/g;

        let match;
        while ((match = regex.exec(contenu)) !== null) {
            const nom = match[1] || match[2] || match[3];
            if (nom && !MOTS_CLES_IGNORES.has(nom)) {
                this.verifierTailleFonction(contenu, match.index, nom, violations);
            }
        }
        return violations;
    }

    /**
     * Vérifie la taille d'une fonction spécifique
     * @private
     */
    verifierTailleFonction(contenu, debut, nom, violations) {
        const fin = trouverFinBloc(contenu, debut);
        const lignes = contenu.substring(debut, fin).split('\n').length;

        if (lignes > AnalyseurLignesFonctions.LIMITE_LIGNES) {
            violations.push(`[Lignes par Fonction] La fonction "${nom}" contient ${lignes} lignes (limite: ${AnalyseurLignesFonctions.LIMITE_LIGNES}) - Trop de responsabilités`);
        }
    }
}

export default AnalyseurLignesFonctions;
