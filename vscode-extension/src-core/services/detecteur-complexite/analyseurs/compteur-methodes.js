/**
 * Compteur de méthodes pour classes
 */
class CompteurMethodes {
    compter(contenu) {
        const regexMethode = /^\s*(async\s+)?[a-zA-Z_$][a-zA-Z0-9_$]*\s*\([^)]*\)\s*{/gm;
        const correspondances = contenu.match(regexMethode);
        return correspondances ? correspondances.length : 0;
    }
}

export default CompteurMethodes;
