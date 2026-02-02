/**
 * Interface : Validateur
 * 
 * Définit le contrat pour le moteur de validation.
 * Respecte le principe de ségrégation des interfaces (I de SOLID).
 */

/**
 * @interface IValidateur
 */
class IValidateur {
    /**
     * Exécute la validation complète du projet
     * @param {string} cheminRacine - Chemin racine du projet à valider
     * @returns {Promise<Object>} Résultat de la validation
     * @returns {boolean} .succes - True si toutes les règles sont respectées
     * @returns {number} .nombreViolations - Nombre total de violations
     * @returns {Object[]} .rapports - Rapports détaillés par fichier
     */
    async valider(cheminRacine) {
        throw new Error('Méthode valider() doit être implémentée');
    }

    /**
     * Affiche le rapport de validation
     * @param {Object} resultat - Résultat de la validation
     */
    afficherRapport(resultat) {
        throw new Error('Méthode afficherRapport() doit être implémentée');
    }
}

export default IValidateur;
