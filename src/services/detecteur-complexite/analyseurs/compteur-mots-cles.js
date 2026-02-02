/**
 * Analyseur de mots-clés de complexité
 */
class CompteurMotsCles {
    static MOTS_CLES = [
        'if', 'else', 'for', 'while', 'switch', 'case', 'try', 'catch', 'throw'
    ];

    compter(contenu) {
        let total = 0;
        for (const mot of CompteurMotsCles.MOTS_CLES) {
            const regex = new RegExp(`\\b${mot}\\b`, 'g');
            const correspondances = contenu.match(regex);
            if (correspondances) total += correspondances.length;
        }
        return total;
    }
}

export default CompteurMotsCles;
