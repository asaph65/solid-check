import { trouverFinBloc } from './utilitaires.js';

class AnalyseurDependances {
    static LIMITE = 3;

    /**
     * Analyse le contenu pour détecter les propriétés isolées (manque de cohésion)
     * @param {string} contenu - Contenu du fichier
     * @returns {string[]} Liste des violations trouvées
     */
    analyser(contenu) {
        const props = this.extraireProprietes(contenu);
        if (props.size === 0) return [];

        const usage = this.extraireUsages(contenu, props);
        return this.verifierViolations(props, usage);
    }

    /**
     * Extrait les propriétés (this.prop) du contenu
     * @private
     */
    extraireProprietes(contenu) {
        return new Set([...contenu.matchAll(/this\._?([a-zA-Z_$][a-zA-Z0-9_$]*)/g)].map(m => m[1]));
    }

    /**
     * Mappe l'usage des propriétés dans chaque méthode
     * @private
     */
    extraireUsages(contenu, props) {
        const usage = {};
        for (const p of props) usage[p] = new Set();

        const regex = /([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\([^)]*\)\s*{/g;
        let match;

        while ((match = regex.exec(contenu)) !== null) {
            this.indexerUsageMethode(contenu, match, props, usage);
        }
        return usage;
    }

    /**
     * Identifie les propriétés utilisées dans un bloc de méthode
     * @private
     */
    indexerUsageMethode(contenu, match, props, usage) {
        const nom = match[1];
        if (['if', 'for', 'while', 'switch', 'catch', 'constructor'].includes(nom)) return;

        const fin = trouverFinBloc(contenu, match.index);
        const block = contenu.substring(match.index, fin);

        for (const p of props) {
            if (new RegExp(`this\\._?${p}\\b`).test(block)) {
                usage[p].add(nom);
            }
        }
    }

    /**
     * Vérifie s'il y a trop de propriétés non liées entre elles
     * @private
     */
    verifierViolations(props, usage) {
        const nonLiees = Array.from(props).filter(p1 => this.verifierSiProprieteIsolee(p1, props, usage));

        if (nonLiees.length > AnalyseurDependances.LIMITE) {
            return [`[Dépendances Internes] ${nonLiees.length} propriétés isolées (${nonLiees.join(', ')}) - Manque de cohésion`];
        }
        return [];
    }

    /**
     * Détermine si une propriété n'est liée à aucune autre par une méthode commune
     * @private
     */
    verifierSiProprieteIsolee(p1, props, usage) {
        if (usage[p1].size === 0) return false;

        for (const p2 of props) {
            if (p1 !== p2 && this.verifierMethodesCommunes(usage[p1], usage[p2])) {
                return false;
            }
        }
        return true;
    }

    /**
     * Vérifie si deux ensembles de méthodes ont une intersection
     * @private
     */
    verifierMethodesCommunes(methodes1, methodes2) {
        for (const m of methodes1) {
            if (methodes2.has(m)) return true;
        }
        return false;
    }
}

export default AnalyseurDependances;
