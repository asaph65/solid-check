/**
 * Analyseur de Fichier Individuel
 * Responsable de l'exécution des analyseurs sur un seul fichier.
 */
class AnalyseurFichier {
    constructor(analyseurs, configuration) {
        this.analyseurs = analyseurs;
        this.config = configuration;
    }

    async analyser(donneesFichier) {
        const resultats = [];
        let violations = 0;

        for (const analyseur of this.analyseurs) {
            const res = await analyseur.analyser(
                donneesFichier.chemin,
                donneesFichier.contenu,
                this.config
            );
            resultats.push(res);
            violations += res.violations.length;
        }

        return {
            fichier: donneesFichier.chemin,
            nombreLignes: donneesFichier.nombreLignes,
            nombreViolations: violations,
            analyseurs: resultats
        };
    }
}

export default AnalyseurFichier;
