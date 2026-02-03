import AnalyseurRatioEt from './analyseur-ratio-et.js';
import AnalyseurDiversiteVerbes from './analyseur-diversite-verbes.js';
import AnalyseurLignesFonctions from './analyseur-lignes-fonctions.js';
import AnalyseurDependances from './analyseur-dependances.js';

/**
 * Détecteur de Responsabilité (Facade)
 * 
 * Orchestre les stratégies d'analyse de cohésion.
 * Refactorisé pour respecter le SRP et la limite de 100 lignes.
 */
class DetecteurDeResponsabilite {
    constructor() {
        this.strategies = [
            { algo: new AnalyseurRatioEt(), poids: 15, stat: 'nombreViolationsRatioEt' },
            { algo: new AnalyseurDiversiteVerbes(), poids: 20, stat: 'nombreViolationsDiversite' },
            { algo: new AnalyseurLignesFonctions(), poids: 10, stat: 'nombreViolationsLignes' },
            { algo: new AnalyseurDependances(), poids: 25, stat: 'nombreViolationsDependances' }
        ];
    }

    analyser(contenu, cheminFichier = '') {
        const violations = [];
        let score = 100;
        const stats = {};

        for (const { algo, poids, stat } of this.strategies) {
            const v = algo.analyser(contenu);
            violations.push(...v);
            score -= v.length * poids;
            stats[stat] = v.length;
        }

        score = Math.max(0, Math.min(100, score));

        return {
            scoreDeCohesion: score,
            listeDesViolations: violations,
            estValide: score >= 70,
            fichier: cheminFichier,
            statistiques: stats
        };
    }
}

export default DetecteurDeResponsabilite;
