import { trouverFinBloc } from './utilitaires.js';
import { MOTS_CLES_IGNORES, REGEX_FONCTIONS } from './constantes.js';

class AnalyseurRatioEt {
    static CONJONCTIONS = ['Et', 'And', 'Ou', 'Or', 'Puis', 'Then'];

    /**
     * Analyse le contenu pour détecter les conjonctions dans les noms de fonctions
     * @param {string} contenu - Contenu du fichier
     * @returns {string[]} Liste des violations trouvées
     */
    analyser(contenu) {
        const violations = [];
        const nomsFonctions = this.extraireNomsFonctions(contenu);

        for (const nom of nomsFonctions) {
            const conjonctionMatch = this.trouverConjonctionDansNom(nom);
            if (conjonctionMatch) {
                violations.push(
                    `[Ratio ET] La fonction "${nom}" contient une conjonction "${conjonctionMatch}" - Violation potentielle du SRP`
                );
            }
        }
        return violations;
    }

    /**
     * Extrait les noms des fonctions du contenu
     */
    extraireNomsFonctions(contenu) {
        const noms = [];
        const regex = new RegExp(REGEX_FONCTIONS, 'g');
        let match;

        while ((match = regex.exec(contenu)) !== null) {
            const nom = match[1] || match[2] || match[3];
            if (nom && !MOTS_CLES_IGNORES.has(nom)) {
                noms.push(nom);
            }
        }
        return noms;
    }

    /**
     * Cherche une conjonction dans un nom de fonction
     */
    trouverConjonctionDansNom(nom) {
        for (const conjonction of AnalyseurRatioEt.CONJONCTIONS) {
            if (this.verifierPresenceConjonction(nom, conjonction)) {
                return conjonction;
            }
        }
        return null;
    }

    /**
     * Vérifie si une conjonction précise est présente dans le nom
     */
    verifierPresenceConjonction(nom, conjonction) {
        const regexCamel = new RegExp(`[a-z0-9](${conjonction})([A-Z0-9]|$)`, 'g');
        const conjLower = conjonction.toLowerCase();
        const regexSnake = new RegExp(`_(${conjLower})_`, 'g');

        return regexCamel.test(nom) || regexSnake.test(nom);
    }
}

export default AnalyseurRatioEt;
