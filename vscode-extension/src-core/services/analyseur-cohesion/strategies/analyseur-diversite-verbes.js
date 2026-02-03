import { MOTS_CLES_IGNORES, REGEX_FONCTIONS } from './constantes.js';

class AnalyseurDiversiteVerbes {
    static CATEGORIES_VERBES = {
        donnees: ['sauvegarder', 'charger', 'lire', 'ecrire', 'stocker', 'recuperer', 'save', 'load', 'read', 'write', 'store', 'fetch', 'get', 'set'],
        utilisateur: ['creer', 'supprimer', 'modifier', 'authentifier', 'autoriser', 'create', 'delete', 'update', 'authenticate', 'authorize', 'remove'],
        calcul: ['calculer', 'additionner', 'soustraire', 'multiplier', 'diviser', 'compute', 'calculate', 'add', 'subtract', 'multiply', 'divide'],
        communication: ['envoyer', 'recevoir', 'notifier', 'publier', 'send', 'receive', 'notify', 'publish', 'emit', 'broadcast'],
        affichage: ['afficher', 'masquer', 'render', 'show', 'hide', 'display', 'draw', 'paint'],
        validation: ['valider', 'verifier', 'controler', 'validate', 'verify', 'check', 'test']
    };

    /**
     * Analyse le contenu pour détecter le mélange de domaines (diversité des verbes)
     * @param {string} contenu - Contenu du fichier
     * @returns {string[]} Liste des violations trouvées
     */
    analyser(contenu) {
        const violations = [];
        const categoriesTrouvees = new Set();
        const verbesParCategorie = {};

        const regex = new RegExp(REGEX_FONCTIONS, 'g');
        let correspondance;

        while ((correspondance = regex.exec(contenu)) !== null) {
            const nomFonction = correspondance[1] || correspondance[2] || correspondance[3];

            if (nomFonction && !MOTS_CLES_IGNORES.has(nomFonction)) {
                this.classerFonction(nomFonction, categoriesTrouvees, verbesParCategorie);
            }
        }

        if (categoriesTrouvees.size > 3) {
            this.ajouterViolation(violations, categoriesTrouvees, verbesParCategorie);
        }

        return violations;
    }

    /**
     * Classe une fonction dans une catégorie basée sur son nom
     * @private
     */
    classerFonction(nom, categoriesTrouvees, verbesParCategorie) {
        const entries = Object.entries(AnalyseurDiversiteVerbes.CATEGORIES_VERBES);

        for (const [categorie, verbes] of entries) {
            const verbeTrouve = this.trouverVerbeDansNom(nom, verbes);
            if (verbeTrouve) {
                categoriesTrouvees.add(categorie);
                if (!verbesParCategorie[categorie]) verbesParCategorie[categorie] = [];
                verbesParCategorie[categorie].push(nom);
                return;
            }
        }
    }

    /**
     * Cherche si un nom commence par un des verbes fournis
     * @private
     */
    trouverVerbeDansNom(nom, verbes) {
        for (const verbe of verbes) {
            if (new RegExp(`^${verbe}`, 'i').test(nom)) {
                return verbe;
            }
        }
        return null;
    }

    /**
     * Ajoute une violation de diversité si trop de domaines sont mélangés
     * @private
     */
    ajouterViolation(violations, categories, verbesMap) {
        const listeCategories = Array.from(categories).join(', ');
        violations.push(
            `[Diversité des Verbes] Le fichier mélange ${categories.size} domaines différents (${listeCategories}) - Manque de cohésion`
        );
        for (const [categorie, fonctions] of Object.entries(verbesMap)) {
            if (fonctions.length > 0) {
                violations.push(`  → Domaine "${categorie}": ${fonctions.join(', ')}`);
            }
        }
    }
}

export default AnalyseurDiversiteVerbes;
