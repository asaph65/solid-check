import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

class ChargeurReglesUniverselles {
    constructor() {
        this.cache = null;
    }

    async charger() {
        if (!this.cache) {
            try {
                const __dirname = path.dirname(fileURLToPath(import.meta.url));
                // On est dans src/services/analyseur-universel/strategies/
                // Config est dans ../../../../config/langages.json
                const cheminConfig = path.resolve(__dirname, '../../../../config/langages.json');
                const contenu = await fs.readFile(cheminConfig, 'utf-8');
                this.cache = JSON.parse(contenu);
            } catch (error) {
                console.error("Erreur chargement langages.json:", error);
                this.cache = {};
            }
        }
        return this.cache;
    }

    detecterLangage(cheminFichier, regles) {
        const ext = path.extname(cheminFichier);
        for (const [langage, config] of Object.entries(regles)) {
            if (config.extensions.includes(ext)) {
                return { nom: langage, config };
            }
        }
        return null;
    }
}

export default ChargeurReglesUniverselles;
