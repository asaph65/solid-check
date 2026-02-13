import path from 'path';

/**
 * Détecteur de Contexte
 * 
 * Identifie le type de composant basé sur le nom du fichier et son arborescence.
 * Cela permet d'appliquer des règles plus souples ou plus strictes selon le rôle.
 */
class DetecteurContexte {
    constructor() {
        this.patterns = {
            'CONTROLLER': [/Controller(\.[a-z]+)?$/, /controller\//],
            'REPOSITORY': [/Repository(\.[a-z]+)?$/, /repository\//, /dao\//],
            'SERVICE': [/Service(\.[a-z]+)?$/, /service\//],
            'ENTITY': [/Entity(\.[a-z]+)?$/, /model\//, /entities\//],
            'UTILITY': [/Utils(\.[a-z]+)?$/, /Helper(\.[a-z]+)?$/, /utils\//, /helpers\//]
        };
    }

    /**
     * Détecte le contexte d'un fichier
     * @param {string} cheminFichier - Chemin complet ou relatif du fichier
     * @returns {Object} Le contexte détecté et sa description
     */
    analyser(cheminFichier) {
        const cheminNormalise = cheminFichier.replace(/\\/g, '/');

        for (const [contexte, regexps] of Object.entries(this.patterns)) {
            if (regexps.some(regex => regex.test(cheminNormalise))) {
                return {
                    type: contexte,
                    description: this._obtenirDescription(contexte)
                };
            }
        }

        return {
            type: 'GENERIQUE',
            description: 'Composant générique sans contraintes spécifiques'
        };
    }

    /**
     * Retourne une description humanisée du contexte
     */
    _obtenirDescription(contexte) {
        const descriptions = {
            'CONTROLLER': 'Orchestrateur d\'entrées/sorties. Tolérance pour une complexité modérée.',
            'REPOSITORY': 'Gestion des données. Tolérance pour un grand nombre de méthodes CRUD.',
            'SERVICE': 'Logique métier. Doit être hautement cohésif (SRP strict).',
            'ENTITY': 'Modèle de données. Doit rester simple.',
            'UTILITY': 'Fonctions utilitaires. Cohésion transversale acceptable.'
        };
        return descriptions[contexte] || 'Composant standard.';
    }
}

export default DetecteurContexte;
