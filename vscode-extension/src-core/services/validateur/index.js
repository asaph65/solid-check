import IValidateur from '../../interfaces/i-validateur.js';
import RapporteurConsole from '../../rapporteur/rapporteur-console.js';
import AnalyseurFichier from './analyseur-fichier.js';

/**
 * Service : Moteur de Validation (Refactorisé)
 * Orchestrateur de haut niveau.
 */
class MoteurValidation extends IValidateur {
    constructor(lecteurFichiers, analyseurs, configuration) {
        super();
        if (!lecteurFichiers || !analyseurs || !configuration) throw new Error('Dépendances manquantes');

        this._lecteur = lecteurFichiers;
        this._analyseurFichier = new AnalyseurFichier(analyseurs, configuration);
        this._config = configuration;
    }

    async valider(racine) {
        console.log('🔍 Démarrage de la validation SOLID-Check...\n');

        try {
            const fichiers = await this._lecteur.listerFichiersAAnalyser(racine, this._config);
            if (fichiers.length === 0) return this._resultatVide();

            console.log(`📁 ${fichiers.length} fichier(s) à analyser\n`);

            const rapports = [];
            let totalViolations = 0;

            for (const f of fichiers) {
                const donnees = await this._lecteur.lireFichierAvecMetadonnees(f);
                const rapport = await this._analyseurFichier.analyser(donnees);
                rapports.push(rapport);
                totalViolations += rapport.nombreViolations;
            }

            return {
                succes: totalViolations === 0,
                nombreViolations: totalViolations,
                nombreFichiers: fichiers.length,
                rapports
            };

        } catch (e) {
            console.error(`❌ Erreur: ${e.message}`);
            throw e;
        }
    }

    _resultatVide() {
        console.log('⚠️  Aucun fichier trouvé.');
        return { succes: true, nombreViolations: 0, rapports: [] };
    }

    afficherRapport(resultat) {
        const rapporteur = RapporteurConsole.obtenirInstance();
        const succes = rapporteur.genererRapport(resultat);
        resultat.succes = succes && resultat.succes;
        return succes;
    }
}

export default MoteurValidation;
