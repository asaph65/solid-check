import IAnalyseur from '../../interfaces/i-analyseur.js';
import ChargeurReglesUniverselles from './strategies/chargeur-regles.js';
import CalculateurDensite from './strategies/calculateur-densite.js';
import AnalyseurNommage from './strategies/analyseur-nommage.js';

class AnalyseurUniversel extends IAnalyseur {
    constructor() {
        super();
        this.chargeur = new ChargeurReglesUniverselles();
    }

    async analyser(cheminFichier, contenu, regles) {
        const configLangages = await this.chargeur.charger();
        const langageDetecte = this.chargeur.detecterLangage(cheminFichier, configLangages);

        if (!langageDetecte) return this._resultatVide(cheminFichier);

        const { nom, config } = langageDetecte;
        const violations = [];

        // 1. Analyse de Densite (Facade vers stratégie)
        const resDensite = CalculateurDensite.calculer(contenu, config.mots_cles_complexite);

        if (resDensite.valeur > 0.8) { // Seuil tolérant pour éviter trop de bruit
            violations.push({
                type: 'DENSITE_LOGIQUE_ELEVEE',
                gravite: 'AVERTISSEMENT', // Warning (Jaune dans CLI)
                message: `[${nom}] Densité logique élevée (${resDensite.valeur}). Code trop compact.`
            });
        }

        // 2. Analyse Nommage (Facade vers stratégie)
        const resNommage = AnalyseurNommage.analyser(contenu, config.regex.fonction);

        return {
            analyseur: 'Analyseur Universel',
            fichier: cheminFichier,
            conforme: violations.length === 0,
            violations,
            metriques: {
                langage: nom,
                densiteLogique: resDensite.valeur,
                nombreFonctions: resNommage.nombreFonctions
            }
        };
    }

    _resultatVide(fichier) {
        return {
            analyseur: 'Analyseur Universel',
            fichier,
            conforme: true,
            violations: [],
            metriques: {}
        };
    }
}

export default AnalyseurUniversel;
