import { trouverFinBloc } from './utilitaires.js';
import { MOTS_CLES_IGNORES, REGEX_FONCTIONS } from './constantes.js';

class AnalyseurRatioEt {
    static CONJONCTIONS = ['Et', 'And', 'Ou', 'Or', 'Puis', 'Then'];

    executer(contenu) {
        const violations = [];
        let correspondance;
        const regex = new RegExp(REGEX_FONCTIONS);

        while ((correspondance = regex.exec(contenu)) !== null) {
            const nomFonction = correspondance[1] || correspondance[2] || correspondance[3];

            if (nomFonction && !MOTS_CLES_IGNORES.has(nomFonction)) {
                for (const conjonction of AnalyseurRatioEt.CONJONCTIONS) {
                    const regexCamel = new RegExp(`[a-z0-9](${conjonction})([A-Z0-9]|$)`, 'g');
                    const conjLower = conjonction.toLowerCase();
                    const regexSnake = new RegExp(`_(${conjLower})_`, 'g');

                    if (regexCamel.test(nomFonction) || regexSnake.test(nomFonction)) {
                        violations.push(
                            `[Ratio ET] La fonction "${nomFonction}" contient une conjonction "${conjonction}" - Violation potentielle du SRP`
                        );
                    }
                }
            }
        }
        return violations;
    }
}

export default AnalyseurRatioEt;
