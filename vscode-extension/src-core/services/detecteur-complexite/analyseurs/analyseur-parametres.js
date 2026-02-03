/**
 * Analyseur de paramètres de fonctions
 */
class AnalyseurParametres {
    analyser(contenu, limite) {
        const complexes = [];
        const regex = /(function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(([^)]*)\)|([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*\(([^)]*)\)\s*=>)/g;

        let match;
        while ((match = regex.exec(contenu)) !== null) {
            const nom = match[2] || match[4] || 'anonyme';
            const params = match[3] || match[5] || '';
            const nb = params.split(',').filter(p => p.trim()).length;

            if (nb > limite) {
                complexes.push({ nom, nombreParametres: nb, limite });
            }
        }
        return complexes;
    }
}

export default AnalyseurParametres;
