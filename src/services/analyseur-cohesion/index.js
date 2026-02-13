import IAnalyseur from '../../interfaces/i-analyseur.js';
import AnalyseurSolidIntelligent from './intelligent/analyseur-solid-intelligent.js';

/**
 * Service : Analyseur de Cohésion (Version Intelligente)
 * 
 * Analyse la cohésion d'un fichier et détecte les violations
 * du principe de responsabilité unique (SRP - S de SOLID).
 * 
 * Cette version utilise un système intelligent (LCOM + Détection de contexte)
 * pour éviter les faux positifs des versions rigides précédentes.
 */
class AnalyseurDeCohesion extends IAnalyseur {
    constructor() {
        super();
        this._analyseurIntelligent = null;
    }

    /**
     * Analyse un fichier pour détecter les violations du SRP
     * @param {string} cheminFichier - Chemin du fichier à analyser
     * @param {string} contenu - Contenu du fichier
     * @param {Object} regles - Règles de validation issues de la configuration
     * @returns {Promise<Object>} Résultat de l'analyse
     */
    async analyser(cheminFichier, contenu, regles) {
        // Initialisation paresseuse avec les règles actuelles
        if (!this._analyseurIntelligent) {
            this._analyseurIntelligent = new AnalyseurSolidIntelligent(regles);
        }

        const resultat = this._analyseurIntelligent.analyserFichier(cheminFichier, contenu);

        // Adaptation au format de sortie attendu par le système de rapport
        const violations = resultat.violations.map(v => ({
            type: 'VIOLATION_SRP',
            gravite: v.severite === 'error' ? 'ERREUR' : 'AVERTISSEMENT',
            message: `⚠️  ${v.raison} : ${v.suggestion}`,
            details: v.details || {}
        }));

        return {
            analyseur: this.obtenirNom(),
            fichier: cheminFichier,
            conforme: resultat.status !== 'error',
            violations,
            metriques: resultat.metriques
        };
    }

    /**
     * Retourne le nom de l'analyseur
     * @returns {string} Nom de l'analyseur
     */
    obtenirNom() {
        return 'Analyseur de Cohésion Intelligent (SRP)';
    }
}

export default AnalyseurDeCohesion;
