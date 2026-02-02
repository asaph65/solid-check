import { trouverFinBloc } from './utilitaires.js';

class AnalyseurDependances {
    static LIMITE = 3;

    executer(contenu) {
        const props = new Set([...contenu.matchAll(/this\._?([a-zA-Z_$][a-zA-Z0-9_$]*)/g)].map(m => m[1]));
        if (props.size === 0) return [];

        const usage = this._mapUsage(contenu, props);
        return this._checkViolations(props, usage);
    }

    _mapUsage(contenu, props) {
        const usage = {};
        for (const p of props) usage[p] = new Set();

        const regex = /([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\([^)]*\)\s*{/g;
        let match;

        while ((match = regex.exec(contenu)) !== null) {
            const nom = match[1];
            if (['if', 'for', 'while', 'switch', 'catch', 'constructor'].includes(nom)) continue;

            const fin = trouverFinBloc(contenu, match.index);
            const block = contenu.substring(match.index, fin);

            for (const p of props) {
                if (new RegExp(`this\\._?${p}\\b`).test(block)) usage[p].add(nom);
            }
        }
        return usage;
    }

    _checkViolations(props, usage) {
        const nonLiees = Array.from(props).filter((p1, k, arr) => {
            if (usage[p1].size === 0) return false;
            return !arr.some(p2 => p1 !== p2 && [...usage[p1]].some(m => usage[p2].has(m)));
        });

        if (nonLiees.length > AnalyseurDependances.LIMITE) {
            return [`[Dépendances Internes] ${nonLiees.length} propriétés isolées (${nonLiees.join(', ')}) - Manque de cohésion`];
        }
        return [];
    }
}

export default AnalyseurDependances;
