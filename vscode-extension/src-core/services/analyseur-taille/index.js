import IAnalyseur from '../../interfaces/i-analyseur.js';

/**
 * Service : Analyseur de Taille de Fichiers
 * 
 * Vérifie que les fichiers ne dépassent pas la limite de lignes configurée.
 * Respecte le principe de responsabilité unique (S de SOLID).
 */
class AnalyseurTaille extends IAnalyseur {
    /**
     * Analyse la taille d'un fichier
     * @param {string} cheminFichier - Chemin du fichier
     * @param {string} contenu - Contenu du fichier
     * @param {Object} regles - Règles de validation
     * @returns {Promise<Object>} Résultat de l'analyse
     */
    async analyser(cheminFichier, contenu, regles) {
        const lignes = contenu.split('\n');
        const nombreLignes = lignes.length;
        const limite = regles.limites.lignesParFichier;

        const conforme = nombreLignes <= limite;
        const violations = [];

        if (!conforme) {
            const message = regles.messages.fichierTropGrand
                .replace('{fichier}', cheminFichier)
                .replace('{lignes}', nombreLignes)
                .replace('{limite}', limite);

            violations.push({
                type: 'TAILLE_FICHIER',
                gravite: 'ERREUR',
                message,
                details: {
                    nombreLignes,
                    limite,
                    depassement: nombreLignes - limite
                }
            });
        }

        return {
            analyseur: this.obtenirNom(),
            fichier: cheminFichier,
            conforme,
            violations,
            metriques: {
                nombreLignes,
                limite
            }
        };
    }

    /**
     * Retourne le nom de l'analyseur
     * @returns {string} Nom de l'analyseur
     */
    obtenirNom() {
        return 'Analyseur de Taille';
    }
}

export default AnalyseurTaille;
