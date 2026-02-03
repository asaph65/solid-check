class AnalyseurNommage {
    static VERBES_ACTION = [
        'get', 'set', 'is', 'has', 'calc', 'compute', 'create', 'update', 'delete',
        'remove', 'add', 'check', 'validate', 'fetch', 'load', 'save', 'write',
        'read', 'calculer', 'valider', 'creer', 'ajouter', 'supprimer', 'lire', 'ecrire', 'analyser', 'executer',
        'init', 'process', 'handle', 'parse', 'format', 'build', 'find', 'search', 'extraire', 'trouver', 'verifier',
        'tester', 'extract', 'test', 'verify', 'evaluate', 'chercher', 'evaluer', 'classer', 'trier', 'compter', 'indexer'
    ];

    // Patterns de conventions de nommage
    static PATTERNS = {
        camelCase: /^[a-z][a-zA-Z0-9]*$/,
        PascalCase: /^[A-Z][a-zA-Z0-9]*$/,
        SCREAMING_SNAKE_CASE: /^[A-Z][A-Z0-9_]*$/,
        snake_case: /^[a-z][a-z0-9_]*$/
    };

    static analyser(contenu, regexStr) {
        const fonctions = this._extraireFonctions(contenu, regexStr);
        const variables = this._extraireVariables(contenu);
        const constantes = this._extraireConstantes(contenu);

        const violations = [];
        const stats = {
            nombreFonctions: fonctions.length,
            nombreVariables: variables.length,
            nombreConstantes: constantes.length
        };

        // Analyse des fonctions (doivent être en camelCase ou PascalCase)
        for (const fct of fonctions) {
            if (!this._estCamelCase(fct) && !this._estPascalCase(fct)) {
                violations.push({
                    type: 'CONVENTION_NOMMAGE',
                    element: fct,
                    categorie: 'fonction',
                    message: `La fonction "${fct}" ne respecte pas camelCase/PascalCase`
                });
            }

            // Vérifier si la fonction commence par un verbe d'action
            const premierMot = fct.split(/(?=[A-Z])|_/)[0].toLowerCase();
            if (!this.VERBES_ACTION.includes(premierMot) && fct.length > 3) {
                violations.push({
                    type: 'NOMMAGE_FONCTION',
                    element: fct,
                    categorie: 'fonction',
                    message: `La fonction "${fct}" devrait commencer par un verbe d'action`
                });
            }
        }

        // Analyse des constantes (doivent être en SCREAMING_SNAKE_CASE)
        for (const cst of constantes) {
            if (!this._estScreamingSnakeCase(cst)) {
                violations.push({
                    type: 'CONVENTION_NOMMAGE',
                    element: cst,
                    categorie: 'constante',
                    message: `La constante "${cst}" devrait être en SCREAMING_SNAKE_CASE`
                });
            }
        }

        // Analyse des variables (doivent être en camelCase)
        for (const variable of variables) {
            if (!this._estCamelCase(variable) && variable.length > 1) {
                violations.push({
                    type: 'CONVENTION_NOMMAGE',
                    element: variable,
                    categorie: 'variable',
                    message: `La variable "${variable}" devrait être en camelCase`
                });
            }
        }

        return {
            ...stats,
            violations,
            conforme: violations.length === 0
        };
    }

    static _estCamelCase(nom) {
        return this.PATTERNS.camelCase.test(nom);
    }

    static _estPascalCase(nom) {
        return this.PATTERNS.PascalCase.test(nom);
    }

    static _estScreamingSnakeCase(nom) {
        return this.PATTERNS.SCREAMING_SNAKE_CASE.test(nom);
    }

    static _estSnakeCase(nom) {
        return this.PATTERNS.snake_case.test(nom);
    }

    static _extraireFonctions(contenu, regexStr) {
        if (!regexStr) return [];
        const regex = new RegExp(regexStr, 'g');
        const fonctions = [];
        let match;
        while ((match = regex.exec(contenu)) !== null) {
            for (let i = 1; i < match.length; i++) {
                if (match[i]) {
                    fonctions.push(match[i]);
                    break;
                }
            }
        }
        return fonctions;
    }

    static _extraireVariables(contenu) {
        const variables = new Set();

        // Extraction des déclarations let/var
        const regexVar = /(?:let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g;
        let match;
        while ((match = regexVar.exec(contenu)) !== null) {
            variables.add(match[1]);
        }

        return Array.from(variables);
    }

    static _extraireConstantes(contenu) {
        const constantes = new Set();

        // Extraction des déclarations const
        const regexConst = /const\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g;
        let match;
        while ((match = regexConst.exec(contenu)) !== null) {
            const nom = match[1];
            // Considérer comme constante si en SCREAMING_SNAKE_CASE
            if (/^[A-Z_][A-Z0-9_]*$/.test(nom)) {
                constantes.add(nom);
            }
        }

        return Array.from(constantes);
    }
}

export default AnalyseurNommage;
