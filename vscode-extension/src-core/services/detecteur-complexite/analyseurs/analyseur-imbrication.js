/**
 * Analyseur de Profondeur d'Imbrication
 * 
 * Détecte les niveaux d'imbrication excessifs dans le code
 * qui peuvent indiquer une complexité cyclomatique élevée.
 */
class AnalyseurImbrication {
    static PROFONDEUR_MAX = 4;

    /**
     * Analyse la profondeur d'imbrication du code
     * @param {string} contenu - Contenu du fichier à analyser
     * @param {number} limiteMax - Limite maximale de profondeur (optionnel)
     * @returns {Object} Résultat de l'analyse
     */
    analyser(contenu, limiteMax = AnalyseurImbrication.PROFONDEUR_MAX) {
        const violations = [];
        const lignes = contenu.split('\n');
        let profondeurActuelle = 0;
        let profondeurMax = 0;
        const lignesProfondes = [];

        // État pour ignorer les contenus de chaînes/regex
        let enChaine = false;
        let typeChaine = null;
        let echappement = false;

        for (let i = 0; i < lignes.length; i++) {
            const ligne = lignes[i];
            let ouvrantes = 0;
            let fermantes = 0;

            for (let j = 0; j < ligne.length; j++) {
                const c = ligne[j];

                if (echappement) {
                    echappement = false;
                    continue;
                }

                if (c === '\\') {
                    echappement = true;
                    continue;
                }

                if (enChaine) {
                    if (c === typeChaine) enChaine = false;
                    continue;
                }

                if (c === '"' || c === "'" || c === '`') {
                    enChaine = true;
                    typeChaine = c;
                    continue;
                }

                // Détection simplifiée de début de regex (heuristique)
                if (c === '/' && j + 1 < ligne.length && ligne[j + 1] !== '/' && ligne[j + 1] !== '*') {
                    // Si on n'est pas déjà en chaîne et que le slash est précédé d'un opérateur ou début de ligne
                    const prec = ligne.substring(0, j).trim();
                    if (prec === '' || /[=,(\[!?:;&|]/.test(prec[prec.length - 1])) {
                        enChaine = true;
                        typeChaine = '/';
                        continue;
                    }
                }

                if (c === '{') ouvrantes++;
                if (c === '}') fermantes++;
            }

            profondeurActuelle += ouvrantes;

            if (profondeurActuelle > profondeurMax) {
                profondeurMax = profondeurActuelle;
            }

            if (profondeurActuelle > limiteMax) {
                lignesProfondes.push({
                    ligne: i + 1,
                    profondeur: profondeurActuelle,
                    contenu: ligne.trim()
                });
            }

            profondeurActuelle -= fermantes;
        }

        // Générer les violations
        if (lignesProfondes.length > 0) {
            const lignesUniques = this._regrouperLignesConsecutives(lignesProfondes);

            for (const groupe of lignesUniques) {
                violations.push({
                    type: 'IMBRICATION_EXCESSIVE',
                    ligne: groupe.ligneDebut,
                    profondeur: groupe.profondeur,
                    message: `Imbrication excessive (niveau ${groupe.profondeur}) détectée à la ligne ${groupe.ligneDebut}${groupe.ligneFin ? `-${groupe.ligneFin}` : ''}`
                });
            }
        }

        return {
            violations,
            profondeurMaximale: profondeurMax,
            nombreViolations: violations.length,
            conforme: violations.length === 0
        };
    }

    /**
     * Regroupe les lignes consécutives pour éviter les doublons
     * @param {Array} lignesProfondes - Liste des lignes avec imbrication excessive
     * @returns {Array} Groupes de lignes consécutives
     */
    _regrouperLignesConsecutives(lignesProfondes) {
        if (lignesProfondes.length === 0) return [];

        const groupes = [];
        let groupeActuel = {
            ligneDebut: lignesProfondes[0].ligne,
            ligneFin: lignesProfondes[0].ligne,
            profondeur: lignesProfondes[0].profondeur
        };

        for (let i = 1; i < lignesProfondes.length; i++) {
            const ligne = lignesProfondes[i];

            // Si la ligne est consécutive et de même profondeur, étendre le groupe
            if (ligne.ligne === groupeActuel.ligneFin + 1 && ligne.profondeur === groupeActuel.profondeur) {
                groupeActuel.ligneFin = ligne.ligne;
            } else {
                // Sinon, sauvegarder le groupe actuel et en commencer un nouveau
                groupes.push({ ...groupeActuel });
                groupeActuel = {
                    ligneDebut: ligne.ligne,
                    ligneFin: ligne.ligne,
                    profondeur: ligne.profondeur
                };
            }
        }

        // Ajouter le dernier groupe
        groupes.push(groupeActuel);

        return groupes;
    }
}

export default AnalyseurImbrication;
