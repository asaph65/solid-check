/**
 * Calculateur de Score
 * Encapsule la logique de calcul de la note globale.
 */
class CalculateurScore {
    static calculer(nbFichiers, nbViolations, aBloquant) {
        if (nbFichiers === 0) return 20;

        let note = 20 - (nbViolations * 0.5);
        if (aBloquant) note = Math.min(note, 10);

        return Math.max(0, Math.round(note * 10) / 10);
    }

    static determinerStatut(score) {
        if (score >= 70) return { couleur: 'VERT', texte: 'Architecture Saine' };
        if (score >= 50) return { couleur: 'JAUNE', texte: 'Attention : Cohésion Faible' };
        return { couleur: 'ROUGE', texte: 'VIOLATION SOLID' };
    }
}

export default CalculateurScore;
