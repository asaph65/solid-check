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

    /**
     * Valide la structure de la configuration
     * @private
     * @param {Object} config - Configuration à valider
     * @throws {Error} Si la configuration est invalide
     */
    _validerConfiguration(config) {
        const champsRequis = ['limites', 'chemins', 'regles', 'messages'];

        for (const champ of champsRequis) {
            if (!config[champ]) {
                throw new Error(`Champ requis manquant dans la configuration: ${champ}`);
            }
        }

        if (typeof config.limites.lignesParFichier !== 'number') {
            throw new Error('limites.lignesParFichier doit être un nombre');
        }

        if (!Array.isArray(config.chemins.aAnalyser)) {
            throw new Error('chemins.aAnalyser doit être un tableau');
        }
    }

    /**
     * Crée une configuration par défaut
     * @returns {Object} Configuration par défaut
     */
    creerConfigurationParDefaut() {
        return {
            limites: {
                lignesParFichier: 100,
                methodesParClasse: 10,
                parametresParFonction: 5
            },
            complexite: {
                motsClésMaximum: 15,
                niveauxImbrication: 4
            },
            chemins: {
                aAnalyser: ['src/**/*.js'],
                aIgnorer: ['node_modules/**', 'test/**']
            },
            regles: {
                verifierTailleFichiers: true,
                verifierComplexite: true,
                echecSurViolation: true
            },
            messages: {
                fichierTropGrand: "⚠️  Le fichier '{fichier}' contient {lignes} lignes (limite: {limite})",
                complexiteTropElevee: "⚠️  Le fichier '{fichier}' a une complexité trop élevée: {raison}",
                validationReussie: "✅ Validation réussie - Tous les fichiers respectent les règles SOLID",
                validationEchouee: "❌ Validation échouée - {nombre} violation(s) détectée(s)"
            }
        };
    }
}

export default ChargeurConfiguration;
