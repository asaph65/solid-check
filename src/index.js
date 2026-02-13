#!/usr/bin/env node
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Configuration
import ChargeurConfiguration from './configuration/chargeur-configuration.js';

// Services
import LecteurSystemeFichiers from './services/lecteur-fichiers/adaptateurs/lecteur-systeme-fichiers.js';
import ServiceLecteurFichiers from './services/lecteur-fichiers/index.js';
import AnalyseurTaille from './services/analyseur-taille/index.js';
import DetecteurComplexite from './services/detecteur-complexite/index.js';
import AnalyseurDeCohesion from './services/analyseur-cohesion/index.js';
import AnalyseurUniversel from './services/analyseur-universel/index.js';
import MoteurValidation from './services/validateur/index.js';



// Obtenir le répertoire courant en mode ES Module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { refactorCommand } from './cli/refactor-command.js';

/**
 * Fonction principale d'exécution
 */
async function executer() {
    try {
        const args = process.argv.slice(2);

        if (args[0] === 'refactor') {
            const filePath = args[1];
            const options = {
                preview: args.includes('--preview'),
                apply: args.includes('--apply'),
                apiKey: args.find(a => a.startsWith('--api-key='))?.split('=')[1]
            };
            if (!filePath) {
                console.error('Usage: solid-check refactor <file> [--preview] [--apply] [--api-key=KEY]');
                process.exit(1);
            }
            await refactorCommand(filePath, options);
            return;
        }

        const chargeur = new ChargeurConfiguration();
        const paths = [
            path.join(process.cwd(), 'config/solid-config-intelligente.json'),
            path.join(process.cwd(), '.solid-check.json'),
            path.join(__dirname, '../config/solid-config-intelligente.json')
        ];

        let configuration = null;
        for (const p of paths) {
            try {
                await fs.access(p);
                configuration = await chargeur.charger(p);
                break;
            } catch { continue; }
        }

        if (!configuration) configuration = chargeur.creerConfigurationParDefaut();

        console.log(`📋 Mode : Analyse Intelligente activée`);

        const adaptateurLecteur = new LecteurSystemeFichiers();
        const lecteurFichiers = new ServiceLecteurFichiers(adaptateurLecteur);

        // Analyseur Unique Intelligent
        const analyseurs = [new AnalyseurDeCohesion()];

        const moteurValidation = new MoteurValidation(lecteurFichiers, analyseurs, configuration);
        const resultat = await moteurValidation.valider(process.cwd());

        moteurValidation.afficherRapport(resultat);
        if (!resultat.succes && configuration.regles?.echecSurViolation !== false) process.exit(1);
        process.exit(0);
    } catch (erreur) {
        console.error('\n❌ Erreur:', erreur.message);
        process.exit(1);
    }
}

// Exécution si appelé directement
const estAppeleDirectement = () => {
    const scriptPath = process.argv[1];
    if (!scriptPath) return false;

    // Normaliser les chemins pour la comparaison (important pour Windows)
    const normalizedScriptPath = path.resolve(scriptPath);
    const normalizedModulePath = path.resolve(__filename);

    // 1. Cas standard : exécution directe (node src/index.js)
    if (normalizedScriptPath === normalizedModulePath) return true;

    // 2. Cas npm/bin : le script est appelé via un lien symbolique ou un wrapper .bin
    // On vérifie si le chemin contient '.bin' et le nom de la commande, 
    // ou s'il se termine par le nom du fichier.
    const baseName = path.basename(normalizedScriptPath);
    const isNpmBin = baseName.startsWith('solid-check') ||
        normalizedScriptPath.includes(path.join('.bin', 'solid-check'));

    return isNpmBin;
};

if (estAppeleDirectement()) {
    executer();
}

// Export pour utilisation en tant que module
export { executer };
export default executer;
