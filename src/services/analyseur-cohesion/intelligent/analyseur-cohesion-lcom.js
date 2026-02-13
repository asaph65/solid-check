import extracteur from './extracteur-code.js';
import path from 'path';

/**
 * Analyseur de Cohésion LCOM (Lack of Cohésion of Methods)
 */
class AnalyseurCohesionLCOM {
    analyser(contenu, cheminFichier = '') {
        const ext = path.extname(cheminFichier) || '.js';
        const props = extracteur.extraireProprietes(contenu, ext);
        const meths = extracteur.extraireMethodes(contenu, ext);

        if (meths.length <= 1) return { score: 100, nombreDeGroupes: 1, methodesCount: meths.length };

        const usages = new Map();
        const selfReferrer = ext === '.py' ? 'self.' : 'this.';

        meths.forEach(m => usages.set(m.nom, props.filter(p => m.corps.includes(`${selfReferrer}${p}`))));

        const groupes = this._calculerGroupes(meths.map(m => m.nom), usages);
        return {
            score: Math.max(0, 100 - (groupes.length - 1) * 20),
            nombreDeGroupes: groupes.length,
            detailsGroupes: groupes,
            statistiques: { totalProprietes: props.length, totalMethodes: meths.length }
        };
    }

    _calculerGroupes(noms, usages) {
        const groupes = [], visites = new Set();
        for (const nom of noms) {
            if (!visites.has(nom)) {
                const grp = [];
                this._explorer(nom, noms, usages, visites, grp);
                groupes.push(grp);
            }
        }
        return groupes;
    }

    _explorer(nom, tous, usages, visites, grp) {
        visites.add(nom); grp.push(nom);
        const props = usages.get(nom) || [];
        for (const v of tous) {
            if (!visites.has(v) && props.some(p => (usages.get(v) || []).includes(p))) {
                this._explorer(v, tous, usages, visites, grp);
            }
        }
    }
}

export default AnalyseurCohesionLCOM;
