/**
 * Interface : Lecteur de Fichiers
 * 
 * Définit le contrat pour tout service de lecture de fichiers.
 * Respecte le principe d'inversion de dépendances (D de SOLID).
 */

/**
 * @interface ILecteurFichiers
 */
class ILecteurFichiers {
  /**
   * Lit le contenu d'un fichier
   * @param {string} cheminFichier - Chemin absolu ou relatif du fichier
   * @returns {Promise<string>} Contenu du fichier
   * @throws {Error} Si le fichier n'existe pas ou n'est pas accessible
   */
  async lireFichier(cheminFichier) {
    throw new Error('Méthode lireFichier() doit être implémentée');
  }

  /**
   * Liste tous les fichiers d'un répertoire selon un motif
   * @param {string} cheminRepertoire - Chemin du répertoire à scanner
   * @param {Array<string>} motifs - Motifs de fichiers à inclure
   * @param {Array<string>} exclusions - Motifs de fichiers à exclure
   * @returns {Promise<Array<string>>} Liste des chemins de fichiers trouvés
   */
  async listerFichiers(cheminRepertoire, motifs, exclusions) {
    throw new Error('Méthode listerFichiers() doit être implémentée');
  }

  /**
   * Vérifie si un fichier existe
   * @param {string} cheminFichier - Chemin du fichier
   * @returns {Promise<boolean>} True si le fichier existe
   */
  async fichierExiste(cheminFichier) {
    throw new Error('Méthode fichierExiste() doit être implémentée');
  }
}

export default ILecteurFichiers;
