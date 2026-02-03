/**
 * Formatteur ANSI
 * Gère uniquement les codes couleurs pour la console.
 */
class FormatteurANSI {
    static COULEURS = {
        RESET: '\x1b[0m',
        VERT: '\x1b[32m',
        JAUNE: '\x1b[33m',
        ROUGE: '\x1b[31m',
        BLEU: '\x1b[34m',
        CYAN: '\x1b[36m',
        GRIS: '\x1b[90m',
        GRAS: '\x1b[1m'
    };

    static texte(couleur, texte) {
        return `${couleur}${texte}${FormatteurANSI.COULEURS.RESET}`;
    }

    static banniere() {
        const { BLEU, GRAS, RESET } = FormatteurANSI.COULEURS;
        return `
${BLEU}${GRAS}╔══════════════════════════════════════════════════════════════════════════╗
║                      RAPPORT D'ARCHITECTURE SOLID                        ║
╚══════════════════════════════════════════════════════════════════════════╝${RESET}
`;
    }
}

export default FormatteurANSI;
