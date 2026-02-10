import fs from 'fs/promises';
import path from 'path';
import { glob } from 'glob';

/**
 * Chargeur de Configuration
 * 
 * Service responsable du chargement et de la validation de la configuration.
 * Respecte le principe de responsabilité unique (S de SOLID).
 */
class ChargeurConfiguration {
    /**
     * Charge la configuration depuis un fichier JSON
     * @param {string} cheminConfiguration - Chemin du fichier de configuration
     * @returns {Promise<Object>} Configuration chargée et validée
     */
    async charger(cheminConfiguration = 'config/regles.json') {
        try {
            const cheminAbsolu = path.resolve(cheminConfiguration);
            const contenu = await fs.readFile(cheminAbsolu, 'utf-8');
            const configuration = JSON.parse(contenu);

            this._validerConfiguration(configuration);

            return configuration;
        } catch (erreur) {
            if (erreur.code === 'ENOENT') {
                throw new Error(`Fichier de configuration introuvable: ${cheminConfiguration}`);
            }
            throw new Error(`Erreur lors du chargement de la configuration: ${erreur.message}`);
        }
    }

    _validerConfiguration(config) {
        // Validation minimale pour la flexibilité intelligente
        if (!config.detecteurs_srp && !config.regles) {
            throw new Error("Configuration invalide : 'detecteurs_srp' ou 'regles' must be present.");
        }
    }

    creerConfigurationParDefaut() {
        return {
            chemins: {
                aAnalyser: ['src/**/*.{js,jsx,ts,tsx}'],
                aIgnorer: ['node_modules/**', 'test/**']
            },
            detecteurs_srp: {
                cohesion: { score_minimum: 60, severite: 'error' },
                responsabilites: { maximum: 3 }
            },
            regles: { echecSurViolation: true },
            regles_par_contexte: {
                patterns: {
                    service: { limites: { cohesion_min: 80 } },
                    repository: { limites: { cohesion_min: 70 } }
                }
            }
        };
    }
}

export default ChargeurConfiguration;
