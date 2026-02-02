class AnalyseurNommage {
    static VERBES_ACTION = [
        'get', 'set', 'is', 'has', 'calc', 'compute', 'create', 'update', 'delete',
        'remove', 'add', 'check', 'validate', 'fetch', 'load', 'save', 'write',
        'read', 'calculer', 'valider', 'creer', 'ajouter', 'supprimer', 'lire', 'ecrire'
    ];

    static analyser(contenu, regexStr) {
        const fonctions = this._extraireFonctions(contenu, regexStr);
        const suspectes = [];

        for (const fct of fonctions) {
            const premierMot = fct.split(/(?=[A-Z])|_/)[0].toLowerCase();
            // Logique de détection basique pour l'instant (démo)
            if (!this.VERBES_ACTION.includes(premierMot) && fct.length > 3) {
                // Pas de verbe d'action détecté
                // suspectes.push(fct); // Désactivé pour réduire le bruit en démo
            }
        }

        return {
            nombreFonctions: fonctions.length,
            suspectes
        };
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
}

export default AnalyseurNommage;
