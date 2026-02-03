import IAnalyseur from '../../interfaces/i-analyseur.js';
import CompteurMethodes from './analyseurs/compteur-methodes.js';
import CompteurMotsCles from './analyseurs/compteur-mots-cles.js';
import AnalyseurParametres from './analyseurs/analyseur-parametres.js';
import AnalyseurImbrication from './analyseurs/analyseur-imbrication.js';

/**
 * Service : Détecteur de Complexité (Refactorisé)
 */
class DetecteurComplexite extends IAnalyseur {
    constructor() {
        super();
        this.compteurMethodes = new CompteurMethodes();
        this.compteurMotsCles = new CompteurMotsCles();
        this.analyseurParametres = new AnalyseurParametres();
        this.analyseurImbrication = new AnalyseurImbrication();
    }

    async analyser(chemin, contenu, regles) {
        const violations = [];
        const metriques = {};

        // 1. Méthodes
        const nbMethodes = this.compteurMethodes.compter(contenu);
        metriques.nombreMethodes = nbMethodes;
        if (nbMethodes > regles.limites.methodesParClasse) {
            violations.push({
                type: 'TROP_DE_METHODES', gravite: 'AVERTISSEMENT',
                message: `La classe contient ${nbMethodes} méthodes (limite: ${regles.limites.methodesParClasse})`,
                details: { nombreMethodes: nbMethodes, limite: regles.limites.methodesParClasse }
            });
        }

        // 2. Mots-clés
        const freq = this.compteurMotsCles.compter(contenu);
        metriques.frequenceMotsCles = freq;
        if (freq > regles.complexite.motsClésMaximum) {
            violations.push({
                type: 'COMPLEXITE_ELEVEE', gravite: 'AVERTISSEMENT',
                message: `Complexité élevée détectée: ${freq} mots-clés de contrôle (limite: ${regles.complexite.motsClésMaximum})`,
                details: { frequenceMotsCles: freq, limite: regles.complexite.motsClésMaximum }
            });
        }

        // 3. Paramètres
        const fctComplexes = this.analyseurParametres.analyser(contenu, regles.limites.parametresParFonction);
        metriques.nombreFonctionsComplexes = fctComplexes.length;
        if (fctComplexes.length > 0) {
            violations.push({
                type: 'TROP_DE_PARAMETRES', gravite: 'AVERTISSEMENT',
                message: `${fctComplexes.length} fonction(s) avec trop de paramètres`,
                details: { fonctions: fctComplexes }
            });
        }

        // 4. Imbrication
        const resImbrication = this.analyseurImbrication.analyser(contenu);
        metriques.profondeurMaximale = resImbrication.profondeurMaximale;
        metriques.nombreViolationsImbrication = resImbrication.nombreViolations;
        if (!resImbrication.conforme) {
            for (const violation of resImbrication.violations) {
                violations.push({
                    type: violation.type,
                    gravite: 'AVERTISSEMENT',
                    message: violation.message,
                    details: { ligne: violation.ligne, profondeur: violation.profondeur }
                });
            }
        }

        // Message global si échec
        if (violations.length > 0 && regles.messages.complexiteTropElevee) {
            const globalMsg = regles.messages.complexiteTropElevee
                .replace('{fichier}', chemin)
                .replace('{raison}', violations.map(v => v.message).join(', '));
            violations.unshift({ type: 'COMPLEXITE_GLOBALE', gravite: 'ERREUR', message: globalMsg });
        }

        return {
            analyseur: this.obtenirNom(), fichier: chemin,
            conforme: violations.length === 0, violations, metriques
        };
    }

    obtenirNom() { return 'Détecteur de Complexité'; }
}

export default DetecteurComplexite;
