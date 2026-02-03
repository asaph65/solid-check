/**
 * Trouve l'index de fin d'un bloc {...} en gérant les imbrications et chaînes
 * @param {string} contenu 
 * @param {number} debut 
 * @returns {number} Index de fin
 */
export function trouverFinBloc(contenu, debut) {
    let acc = 0, str = false, esc = false, type = null;

    for (let i = debut; i < contenu.length; i++) {
        const c = contenu[i];

        if (esc) {
            esc = false;
            continue;
        }

        if (c === '\\') {
            esc = true;
            continue;
        }

        if (str) {
            if (c === type) str = false;
            continue;
        }

        if (c === '"' || c === "'" || c === '`') {
            str = true;
            type = c;
            continue;
        }

        if (c === '{') {
            acc++;
            continue;
        }

        if (c === '}') {
            acc--;
            if (acc === 0) return i + 1;
        }
    }
    return contenu.length;
}
