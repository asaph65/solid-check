import fs from 'fs/promises';
import path from 'path';
import { glob } from 'glob';
import ILecteurFichiers from '../../../interfaces/i-lecteur-fichiers.js';

/**
 * Adaptateur : Lecteur Système de Fichiers
 * 
 * Implémentation concrète de ILecteurFichiers utilisant le module fs de Node.js.
 * Respecte le principe de substitution de Liskov (L de SOLID).
 */
class LecteurSystemeFichiers extends ILecteurFichiers {
    /**
     * Lit le contenu d'un fichier
     * @param {string} cheminFichier - Chemin du fichier à lire
     * @returns {Promise<string>} Contenu du fichier
     */
    async lireFichier(cheminFichier) {
        try {
            const contenu = await fs.readFile(cheminFichier, 'utf-8');
            return contenu;
        } catch (erreur) {
            throw new Error(`Impossible de lire le fichier ${cheminFichier}: ${erreur.message}`);
        }
    }

    /**
     * Liste tous les fichiers correspondant aux motifs spécifiés
     * @param {string} cheminRepertoire - Répertoire de base
     * @param {string[]} motifs - Motifs de fichiers à inclure
     * @param {string[]} exclusions - Motifs de fichiers à exclure
     * @returns {Promise<string[]>} Liste des chemins de fichiers
     */
    async listerFichiers(cheminRepertoire, motifs = ['**/*.{js,jsx,ts,tsx}'], exclusions = []) {
        try {
            const fichiersTrouves = [];

            for (const motif of motifs) {
                const cheminComplet = path.join(cheminRepertoire, motif);
                const resultats = await glob(cheminComplet, {
                    ignore: exclusions,
                    nodir: true,
                    absolute: true
                });

                fichiersTrouves.push(...resultats);
            }

            // Supprime les doublons
            return [...new Set(fichiersTrouves)];
        } catch (erreur) {
            throw new Error(`Erreur lors du listage des fichiers: ${erreur.message}`);
        }
    }

    /**
     * Vérifie si un fichier existe
     * @param {string} cheminFichier - Chemin du fichier
     * @returns {Promise<boolean>} True si le fichier existe
     */
    async fichierExiste(cheminFichier) {
        try {
            await fs.access(cheminFichier);
            return true;
        } catch {
            return false;
        }
    }
}

export default LecteurSystemeFichiers;
