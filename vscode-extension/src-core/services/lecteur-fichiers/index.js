/**
 * Service : Lecteur de Fichiers
 * 
 * Service de haut niveau pour la lecture de fichiers.
 * Utilise l'injection de dépendances pour respecter le principe D de SOLID.
 * Respecte le principe de responsabilité unique (S de SOLID).
 */
class ServiceLecteurFichiers {
    /**
     * Constructeur avec injection de dépendances
     * @param {ILecteurFichiers} adaptateur - Implémentation concrète du lecteur
     */
    constructor(adaptateur) {
        if (!adaptateur) {
            throw new Error('Un adaptateur de lecteur de fichiers est requis');
        }
        this._adaptateur = adaptateur;
    }

    /**
     * Lit un fichier et retourne son contenu avec métadonnées
     * @param {string} cheminFichier - Chemin du fichier
     * @returns {Promise<Object>} Objet contenant le contenu et les métadonnées
     */
    async lireFichierAvecMetadonnees(cheminFichier) {
        const contenu = await this._adaptateur.lireFichier(cheminFichier);
        const lignes = contenu.split('\n');

        return {
            chemin: cheminFichier,
            contenu,
            nombreLignes: lignes.length,
            taille: contenu.length
        };
    }

    /**
     * Liste les fichiers à analyser selon la configuration
     * @param {string} cheminRacine - Répertoire racine
     * @param {Object} configuration - Configuration des chemins
     * @returns {Promise<string[]>} Liste des fichiers à analyser
     */
    async listerFichiersAAnalyser(cheminRacine, configuration) {
        const { aAnalyser, aIgnorer } = configuration.chemins;

        return await this._adaptateur.listerFichiers(
            cheminRacine,
            aAnalyser,
            aIgnorer
        );
    }

    /**
     * Vérifie si un fichier existe
     * @param {string} cheminFichier - Chemin du fichier
     * @returns {Promise<boolean>} True si le fichier existe
     */
    async fichierExiste(cheminFichier) {
        return await this._adaptateur.fichierExiste(cheminFichier);
    }
}

export default ServiceLecteurFichiers;
