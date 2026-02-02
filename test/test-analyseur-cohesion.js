/**
 * Script de Test pour l'Analyseur de Cohésion
 * 
 * Teste le DetecteurDeResponsabilite sur un fichier avec violations intentionnelles.
 */

import DetecteurDeResponsabilite from '../src/services/analyseur-cohesion/strategies/detecteur-responsabilite.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testerDetecteur() {
    console.log('🧪 Test de l\'Analyseur de Cohésion\n');
    console.log('='.repeat(80));

    // Charge le fichier de test
    const cheminFichierTest = path.join(__dirname, 'fichier-test-srp.js');
    const contenu = await fs.readFile(cheminFichierTest, 'utf-8');

    // Crée une instance du détecteur
    const detecteur = new DetecteurDeResponsabilite();

    // Analyse le fichier
    console.log('\n📄 Analyse du fichier: fichier-test-srp.js\n');
    const resultat = detecteur.analyser(contenu, cheminFichierTest);

    // Affiche les résultats
    console.log('📊 RÉSULTATS DE L\'ANALYSE');
    console.log('='.repeat(80));
    console.log(`\n✓ Score de Cohésion: ${resultat.scoreDeCohesion}/100`);
    console.log(`✓ Est Valide: ${resultat.estValide ? '✅ OUI' : '❌ NON'}`);
    console.log(`✓ Nombre de Violations: ${resultat.listeDesViolations.length}\n`);

    console.log('📈 STATISTIQUES PAR ALGORITHME');
    console.log('='.repeat(80));
    console.log(`  • Ratio "ET": ${resultat.statistiques.nombreViolationsRatioEt} violation(s)`);
    console.log(`  • Diversité des Verbes: ${resultat.statistiques.nombreViolationsDiversite} violation(s)`);
    console.log(`  • Lignes par Fonction: ${resultat.statistiques.nombreViolationsLignes} violation(s)`);
    console.log(`  • Dépendances Internes: ${resultat.statistiques.nombreViolationsDependances} violation(s)\n`);

    if (resultat.listeDesViolations.length > 0) {
        console.log('⚠️  VIOLATIONS DÉTECTÉES');
        console.log('='.repeat(80));
        for (const violation of resultat.listeDesViolations) {
            console.log(`  ${violation}`);
        }
    }

    console.log('\n' + '='.repeat(80));
    console.log('\n✅ Test terminé avec succès !\n');

    return resultat;
}

// Exécution
testerDetecteur().catch(erreur => {
    console.error('❌ Erreur lors du test:', erreur.message);
    process.exit(1);
});
