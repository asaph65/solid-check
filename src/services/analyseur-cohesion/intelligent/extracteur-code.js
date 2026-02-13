import path from 'path';

/**
 * Service d'extraction de code multi-langages
 */
class ExtracteurCode {
    /**
     * Extrait les méthodes d'un contenu selon le langage
     */
    extraireMethodes(contenu, extension) {
        switch (extension) {
            case '.js':
            case '.ts':
            case '.jsx':
            case '.tsx':
                return this._extraireJS(contenu);
            case '.java':
                return this._extraireJava(contenu);
            case '.py':
                return this._extrairePython(contenu);
            default:
                return this._extraireJS(contenu); // Repli par défaut
        }
    }

    /**
     * Extrait les propriétés/champs d'un contenu selon le langage
     */
    extraireProprietes(contenu, extension) {
        switch (extension) {
            case '.js':
            case '.ts':
                return this._extrairePropsJS(contenu);
            case '.java':
                return this._extrairePropsJava(contenu);
            case '.py':
                return this._extrairePropsPython(contenu);
            default:
                return this._extrairePropsJS(contenu);
        }
    }

    // --- JavaScript ---
    _extraireJS(contenu) {
        const matches = [...contenu.matchAll(/(\w+)\s*\([^)]*\)\s*\{([\s\S]*?)\}/g)];
        return matches.filter(m => !['if', 'for', 'while', 'switch', 'catch', 'constructor'].includes(m[1]))
            .map(m => ({ nom: m[1], corps: m[2] }));
    }

    _extrairePropsJS(contenu) {
        const matches = [...contenu.matchAll(/this\.(\w+)\s*=/g)];
        return [...new Set(matches.map(m => m[1]))].filter(p => !['prototype', 'constructor'].includes(p));
    }

    // --- Java ---
    _extraireJava(contenu) {
        // Regex Java plus robuste pour les méthodes
        const matches = [...contenu.matchAll(/(?:public|protected|private|static|\s) +[\w<>[\]]+ +([a-zA-Z_][a-zA-Z0-9_]*) *\(.*?\)\s*\{([\s\S]*?)\}/g)];
        return matches.map(m => ({ nom: m[1], corps: m[2] }));
    }

    _extrairePropsJava(contenu) {
        // Champs d'instance Java
        const matches = [...contenu.matchAll(/(?:private|protected|public)\s+[\w<>[\]]+\s+([a-zA-Z_][a-zA-Z0-9_]*)(?:\s*=.*?)?;/g)];
        return [...new Set(matches.map(m => m[1]))];
    }

    // --- Python ---
    _extrairePython(contenu) {
        // Regex plus flexible pour Python
        const matches = [...contenu.matchAll(/^\s*def\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(.*?\)\s*:(.*)/gm)];
        // Note: Pour extraire le corps on va simplement prendre tout jusqu'au prochain def ou class
        const results = [];
        for (let i = 0; i < matches.length; i++) {
            const start = matches[i].index;
            const end = i < matches.length - 1 ? matches[i + 1].index : contenu.length;
            results.push({ nom: matches[i][1], corps: contenu.substring(start, end) });
        }
        return results;
    }

    _extrairePropsPython(contenu) {
        // Attributs d'instance Python (self.x)
        const matches = [...contenu.matchAll(/self\.([a-zA-Z_][a-zA-Z0-9_]*)\s*=/g)];
        const props = [...new Set(matches.map(m => m[1]))];
        // console.log('[DEBUG Python Props]', props);
        return props;
    }
}

export default new ExtracteurCode();
