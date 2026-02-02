/**
 * Exemple d'Utilisation Basique de SOLID-Check
 * 
 * Démontre comment utiliser la librairie de manière programmatique
 * avec injection de dépendances.
 */

import path from 'path';
import { fileURLToPath } from 'url';

// Import des services
import ChargeurConfiguration from '../src/configuration/chargeur-configuration.js';
import LecteurSystemeFichiers from '../src/services/lecteur-fichiers/adaptateurs/lecteur-systeme-fichiers.js';
import ServiceLecteurFichiers from '../src/services/lecteur-fichiers/index.js';
import AnalyseurTaille from '../src/services/analyseur-taille/index.js';
import DetecteurComplexite from '../src/services/detecteur-complexite/index.js';
import MoteurValidation from '../src/services/validateur/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function exemple() {
    console.log('🎯 Exemple d\'utilisation de SOLID-Check\n');
    console.log('Cet exemple démontre l\'injection de dépendances et l\'architecture micro-services.\n');

    try {
        // 1. Chargement de la configuration
        console.log('📝 Étape 1 : Chargement de la configuration');
        const chargeur = new ChargeurConfiguration();
        const configuration = await chargeur.charger(
            path.join(__dirname, '../config/regles.json')
        );
        console.log('✅ Configuration chargée\n');

        // 2. Construction des services avec injection de dépendances
        console.log('🔧 Étape 2 : Construction des services (injection de dépendances)');

        // Adaptateur de lecture de fichiers
        const adaptateurLecteur = new LecteurSystemeFichiers();
        console.log('  ✓ Adaptateur de lecture créé');

        // Service de lecture (injecté avec l'adaptateur)
        const lecteurFichiers = new ServiceLecteurFichiers(adaptateurLecteur);
        console.log('  ✓ Service de lecture créé avec injection');

        // Analyseurs indépendants
        const analyseurs = [
            new AnalyseurTaille(),
            new DetecteurComplexite()
        ];
        console.log('  ✓ Analyseurs créés (Taille, Complexité)');

        // Moteur de validation (orchestrateur)
        const moteurValidation = new MoteurValidation(
            lecteurFichiers,
            analyseurs,
            configuration
        );
        console.log('  ✓ Moteur de validation créé\n');

        // 3. Exécution de la validation
        console.log('🚀 Étape 3 : Exécution de la validation\n');
        const cheminRacine = path.join(__dirname, '..');
        const resultat = await moteurValidation.valider(cheminRacine);

        // 4. Affichage du rapport
        moteurValidation.afficherRapport(resultat);

        // 5. Résultat
        if (resultat.succes) {
            console.log('🎉 Validation réussie !');
            return 0;
        } else {
            console.log('⚠️  Des violations ont été détectées.');
            return 1;
        }

    } catch (erreur) {
        console.error('❌ Erreur:', erreur.message);
        return 1;
    }
}

// Exécution
exemple().then(code => {
    console.log(`\n📊 Code de sortie: ${code}`);
    process.exit(code);
});
