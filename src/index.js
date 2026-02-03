#!/usr/bin/env node
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

/**
 * Fonction principale d'exécution
 */
async function executer() {
    try {
        // 1. Chargement de la configuration
        const chargeur = new ChargeurConfiguration();

        // Chercher la configuration dans plusieurs emplacements (projet utilisateur d'abord)
        const configPaths = [
            path.join(process.cwd(), 'config/regles.json'),
            path.join(process.cwd(), '.solid-check.json'),
            path.join(__dirname, '../config/regles.json')
        ];

        let configuration = null;
        for (const configPath of configPaths) {
            try {
                configuration = await chargeur.charger(configPath);
                console.log(`📋 Configuration chargée depuis: ${path.relative(process.cwd(), configPath) || configPath}`);
                break;
            } catch (error) {
                // Continuer vers le prochain chemin
                continue;
            }
        }

        if (!configuration) {
            throw new Error('Aucun fichier de configuration trouvé. Veuillez créer config/regles.json ou .solid-check.json');
        }

        // 2. Injection de dépendances - Construction des services

        // Service de lecture de fichiers (avec adaptateur)
        const adaptateurLecteur = new LecteurSystemeFichiers();
        const lecteurFichiers = new ServiceLecteurFichiers(adaptateurLecteur);

        // Analyseurs indépendants
        const analyseurs = [];

        // Toujours activer l'analyseur universel pour la démo multi-langages
        analyseurs.push(new AnalyseurUniversel());

        if (configuration.regles.verifierTailleFichiers) {
            analyseurs.push(new AnalyseurTaille());
        }

        if (configuration.regles.verifierComplexite) {
            analyseurs.push(new DetecteurComplexite());
        }

        if (configuration.regles.verifierCohesion) {
            analyseurs.push(new AnalyseurDeCohesion());
        }

        // 3. Création du moteur de validation (orchestrateur)
        const moteurValidation = new MoteurValidation(
            lecteurFichiers,
            analyseurs,
            configuration
        );

        // 4. Exécution de la validation
        const cheminRacine = process.cwd();
        const resultat = await moteurValidation.valider(cheminRacine);

        // 5. Affichage du rapport
        moteurValidation.afficherRapport(resultat);

        // 6. Code de sortie selon le résultat
        if (!resultat.succes && configuration.regles.echecSurViolation) {
            process.exit(1);
        }

        process.exit(0);

    } catch (erreur) {
        console.error('\n❌ Erreur fatale:', erreur.message);
        console.error(erreur.stack);
        process.exit(1);
    }
}

// Exécution si appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
    executer();
}

// Export pour utilisation en tant que module
export { executer };
export default executer;
