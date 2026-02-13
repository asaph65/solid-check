import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Moteur de pont pour l'extension SOLID-Check
 * Permet de faire le lien entre le texte de l'éditeur et les analyseurs SOLID
 */
class MoteurAnalyse {
    constructor() {
        this.engineInitialized = false;
        this.AnalyseurDeCohesion = null;
    }

    async initialiser() {
        if (this.engineInitialized) return;
        try {
            const baseDir = path.join(__dirname, '..', 'src-core');
            const cohesionPath = path.join(baseDir, 'services', 'analyseur-cohesion', 'index.js');
            const cohe = await import('file://' + cohesionPath);
            this.AnalyseurDeCohesion = new cohe.default();
            this.engineInitialized = true;
        } catch (error) {
            console.error('[SOLID-Check] Erreur initialisation moteur:', error);
        }
    }

    async analyser(cheminFichier, contenu) {
        if (!this.engineInitialized) await this.initialiser();
        const violations = [];
        const lignes = contenu.split(/\r?\n/);

        try {
            const res = await this.AnalyseurDeCohesion.analyser(cheminFichier, contenu, {});
            if (res.violations) {
                for (const v of res.violations) {
                    let pos = { ligne: 1, colonne: 0, longueur: (lignes[0] || '').length };

                    // Tentative simple de positionnement pour les méthodes
                    const matchNom = v.message.match(/"([^"]+)"/);
                    if (matchNom) pos = this._trouverPosition(contenu, matchNom[1], 'METHODE', lignes);

                    violations.push({
                        message: v.message,
                        gravite: v.gravite,
                        ligne: pos.ligne,
                        colonne: pos.colonne,
                        longueur: pos.longueur,
                        code: v.type
                    });
                }
            }
        } catch (error) {
            console.error('[SOLID-Check] Erreur moteur:', error);
        }
        return violations;
    }

    _trouverPosition(contenu, element, type, lignes) {
        if (!element) return { ligne: 1, colonne: 0, longueur: 10 };
        const index = contenu.indexOf(element);
        if (index === -1) return { ligne: 1, colonne: 0, longueur: element.length };
        let currentPos = 0;
        for (let i = 0; i < lignes.length; i++) {
            const ligneContenu = lignes[i];
            const nextPos = currentPos + ligneContenu.length + 1;
            if (index >= currentPos && index < nextPos) {
                return { ligne: i + 1, colonne: index - currentPos, longueur: element.length };
            }
            currentPos = nextPos;
        }
        return { ligne: 1, colonne: 0, longueur: element.length };
    }
}

export default new MoteurAnalyse();
