import AnalyseurCohesionLCOM from './analyseur-cohesion-lcom.js';
import DetecteurResponsabilites from './detecteur-responsabilites.js';
import DetecteurContexte from './detecteur-contexte.js';

/**
 * Analyseur SOLID Intelligent (Cohésion > Taille, Adaptation au Contexte)
 */
class AnalyseurSolidIntelligent {
    constructor(config = {}) {
        this.config = config;
        this.lcom = new AnalyseurCohesionLCOM();
        this.detecteurResp = new DetecteurResponsabilites();
        this.detecteurCtx = new DetecteurContexte();

        const def = {
            cohesion: { score_minimum: 60, severite: 'error' },
            responsabilites: { maximum: 3 }
        };
        this.seuils = {
            cohesion: { ...def.cohesion, ...(config.detecteurs_srp?.cohesion || {}) },
            responsabilites: { ...def.responsabilites, ...(config.detecteurs_srp?.responsabilites || {}) }
        };
    }

    analyserFichier(chemin, contenu) {
        const contexte = this.detecteurCtx.analyser(chemin);
        const resCohesion = this.lcom.analyser(contenu, chemin);
        const resResp = this.detecteurResp.analyser(contenu, chemin);
        const lignes = contenu.split('\n').length;
        const violations = [];
        let status = 'success';

        // Règle 1 : Multiples responsabilités
        if (resResp.nombreDeCategories > this.seuils.responsabilites.maximum) {
            status = 'error';
            violations.push({
                principe: 'SRP', raison: 'Multiples responsabilités', severite: 'error',
                details: { categories: resResp.categories, nombre: resResp.nombreDeCategories },
                suggestion: `Séparer par domaine : ${resResp.categories.join(', ')}`
            });
        }

        // Règle 2 : Cohésion faible (LCOM)
        if (resCohesion.score < this.seuils.cohesion.score_minimum && contexte.type !== 'UTILITY') {
            status = 'error';
            violations.push({
                principe: 'SRP', raison: 'Cohésion faible (LCOM)', severite: 'error',
                score: resCohesion.score,
                suggestion: `${resCohesion.nombreDeGroupes} groupes de propriétés distincts.`
            });
        }

        // Règle 3 : Taille vs Cohésion
        if (!(lignes > 150 && resCohesion.score >= 80) && (lignes > 200 && resCohesion.score < 80)) {
            status = 'error';
            violations.push({
                principe: 'SRP', raison: 'Fichier long avec cohésion moyenne', severite: 'warning',
                suggestion: 'Le fichier est volumineux et sa cohésion pourrait être améliorée.'
            });
        }

        // Clémence pour les repositories cohésifs
        if (contexte.type === 'REPOSITORY' && status === 'error' && resCohesion.score > 70) {
            status = 'success';
            violations.length = 0;
        }

        return {
            status, fichier: chemin, contexte: contexte.type,
            metriques: {
                cohesion: resCohesion.score,
                responsabilites: resResp.nombreDeCategories,
                lignes: lignes,
                methodes: resCohesion.statistiques?.totalMethodes || 0
            },
            violations
        };
    }
}

export default AnalyseurSolidIntelligent;
