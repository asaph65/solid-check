import { trouverFinBloc } from './utilitaires.js';
import { MOTS_CLES_IGNORES } from './constantes.js';

class AnalyseurLignesFonctions {
    static LIMITE_LIGNES = 20;

    executer(contenu) {
        const violations = [];
        const regex = /(?:function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\([^)]*\)\s*{|([a-zA-Z_$][a-zA-Z0-9_$]*)\s*[:=]\s*(?:async\s+)?function\s*\([^)]*\)\s*{|([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\([^)]*\)\s*(?:=>)?\s*{)/g;

        let match;
        while ((match = regex.exec(contenu)) !== null) {
            const nom = match[1] || match[2] || match[3];
            if (nom && !MOTS_CLES_IGNORES.has(nom)) {
                this._check(contenu, match.index, nom, violations);
            }
        }
        return violations;
    }

    _check(contenu, debut, nom, violations) {
        const fin = trouverFinBloc(contenu, debut);
        const lignes = contenu.substring(debut, fin).split('\n').length;

        if (lignes > AnalyseurLignesFonctions.LIMITE_LIGNES) {
            violations.push(`[Lignes par Fonction] La fonction "${nom}" contient ${lignes} lignes (limite: ${AnalyseurLignesFonctions.LIMITE_LIGNES}) - Trop de responsabilités`);
        }
    }
}

export default AnalyseurLignesFonctions;
