import IAnalyseur from '../../interfaces/i-analyseur.js';
import DetecteurDeResponsabilite from './strategies/detecteur-responsabilite.js';

/**
 * Service : Analyseur de Cohésion
 * 
 * Analyse la cohésion d'un fichier et détecte les violations
 * du principe de responsabilité unique (SRP - S de SOLID).
 * 
 * Utilise le Pattern Strategy via le DetecteurDeResponsabilite.
 * Respecte le principe de responsabilité unique (S de SOLID).
 */
class AnalyseurDeCohesion extends IAnalyseur {
    /**
     * Constructeur avec injection de la stratégie
     * @param {DetecteurDeResponsabilite} detecteur - Stratégie de détection (optionnel)
     */
    constructor(detecteur = null) {
        super();
        // Pattern Strategy : injection de la stratégie de détection
        this._detecteur = detecteur || new DetecteurDeResponsabilite();
    }

    /**
     * Analyse un fichier pour détecter les violations du SRP
     * @param {string} cheminFichier - Chemin du fichier à analyser
     * @param {string} contenu - Contenu du fichier
     * @param {Object} regles - Règles de validation
     * @returns {Promise<Object>} Résultat de l'analyse
     */
    async analyser(cheminFichier, contenu, regles) {
        // Utilise la stratégie injectée pour analyser
        const resultatDetection = this._detecteur.analyser(contenu, cheminFichier);

        // Transforme le résultat en format compatible avec le système
        const violations = [];

        // Ajoute le message global si le fichier n'est pas valide
        if (!resultatDetection.estValide) {
            violations.push({
                type: 'MANQUE_COHESION',
                gravite: 'ERREUR',
                message: `⚠️  Score de cohésion: ${resultatDetection.scoreDeCohesion}/100 - Le fichier viole le principe de responsabilité unique`,
                details: {
                    scoreDeCohesion: resultatDetection.scoreDeCohesion,
                    nombreViolations: resultatDetection.listeDesViolations.length,
                    statistiques: resultatDetection.statistiques
                }
            });

            // Ajoute chaque violation détectée
            for (const violation of resultatDetection.listeDesViolations) {
                violations.push({
                    type: 'VIOLATION_SRP',
                    gravite: 'AVERTISSEMENT',
                    message: violation
                });
            }
        }

        return {
            analyseur: this.obtenirNom(),
            fichier: cheminFichier,
            conforme: resultatDetection.estValide,
            violations,
            metriques: {
                scoreDeCohesion: resultatDetection.scoreDeCohesion,
                nombreViolations: resultatDetection.listeDesViolations.length,
                ...resultatDetection.statistiques
            }
        };
    }

    /**
     * Retourne le nom de l'analyseur
     * @returns {string} Nom de l'analyseur
     */
    obtenirNom() {
        return 'Analyseur de Cohésion (SRP)';
    }

    /**
     * Change la stratégie de détection (Pattern Strategy)
     * @param {DetecteurDeResponsabilite} detecteur - Nouvelle stratégie
     */
    changerStrategie(detecteur) {
        this._detecteur = detecteur;
    }
}

export default AnalyseurDeCohesion;
