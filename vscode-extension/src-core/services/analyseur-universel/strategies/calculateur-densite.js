class CalculateurDensite {
    static calculer(contenu, motsCles) {
        if (!motsCles) return 0;

        const pointsDecision = this._compterPointsDecision(contenu, motsCles);
        const lignesNonVides = contenu.split('\n').filter(l => l.trim().length > 0).length;
        const densite = lignesNonVides > 0 ? (pointsDecision / lignesNonVides) : 0;

        return {
            valeur: parseFloat(densite.toFixed(2)),
            details: { pointsDecision, lignesNonVides }
        };
    }

    static _compterPointsDecision(contenu, motsCles) {
        let total = 0;
        for (const mot of motsCles) {
            const regex = new RegExp(`\\b${mot}\\b`, 'g');
            const matches = contenu.match(regex);
            if (matches) total += matches.length;
        }
        return total;
    }
}

export default CalculateurDensite;
