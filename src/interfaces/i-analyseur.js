/**
 * Interface : Analyseur
 * 
 * Définit le contrat pour tous les analyseurs de code.
 * Respecte le principe de ségrégation des interfaces (I de SOLID).
 */

/**
 * @interface IAnalyseur
 */
class IAnalyseur {
    /**
     * Analyse un fichier selon des règles spécifiques
     * @param {string} cheminFichier - Chemin du fichier à analyser
     * @param {string} contenu - Contenu du fichier
     * @param {Object} regles - Règles de validation à appliquer
     * @returns {Promise<Object>} Résultat de l'analyse
     * @returns {boolean} .conforme - True si le fichier respecte les règles
     * @returns {string[]} .violations - Liste des violations détectées
     */
    async analyser(cheminFichier, contenu, regles) {
        throw new Error('Méthode analyser() doit être implémentée');
    }

    /**
     * Retourne le nom de l'analyseur
     * @returns {string} Nom de l'analyseur
     */
    obtenirNom() {
        throw new Error('Méthode obtenirNom() doit être implémentée');
    }
}

export default IAnalyseur;
