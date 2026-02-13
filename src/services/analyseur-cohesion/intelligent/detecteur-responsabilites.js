import extracteur from './extracteur-code.js';
import path from 'path';

/**
 * Détecteur de Responsabilités Multiples
 */
class DetecteurResponsabilites {
    constructor() {
        this.categories = {
            'CRUD': ['save', 'find', 'get', 'set', 'remove', 'add', 'sauvegarder', 'db.', 'repo.'],
            'VALIDATION': ['validate', 'check', 'verify', 'is', 'has', 'valider', 'verifier', 'est'],
            'NOTIFICATION': ['send', 'notify', 'emit', 'publish', 'envoyer', 'mailer.', 'notifier.'],
            'CALCUL': ['calculate', 'compute', 'process', 'format', 'calculer', 'traiter', 'formater']
        };
    }

    analyser(contenu, cheminFichier = '') {
        const ext = path.extname(cheminFichier) || '.js';
        const methodes = extracteur.extraireMethodes(contenu, ext);
        const detectees = new Map();

        methodes.forEach(m => {
            const cats = this._detecter(m.nom, m.corps);
            cats.forEach(cat => {
                if (!detectees.has(cat)) detectees.set(cat, []);
                detectees.get(cat).push(m.nom);
            });
        });

        const list = Array.from(detectees.keys());
        return {
            categories: list,
            nombreDeCategories: list.length,
            details: Object.fromEntries(detectees),
            estSuspect: list.length > 2
        };
    }

    _detecter(nom, corps) {
        const n = nom.toLowerCase(), c = corps.toLowerCase(), cats = [];
        for (const [cat, words] of Object.entries(this.categories)) {
            if (words.some(w => n.includes(w.replace('.', '')) || c.includes(w))) cats.push(cat);
        }
        return cats;
    }
}

export default DetecteurResponsabilites;
