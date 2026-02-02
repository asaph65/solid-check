/**
 * Utilitaires pour le Rapporteur Console
 */
class UtilitairesRapporteur {
    static grouperParDossier(rapports) {
        const groupes = {};
        for (const r of rapports) {
            if (!r || !r.fichier) continue;
            // Simule path.dirname car on ne peut pas importer path ici facilement sans module? 
            // Si, on est en module. Mais gardons simple.
            const sep = r.fichier.lastIndexOf('/');
            const d = sep === -1 ? '.' : r.fichier.substring(0, sep);
            (groupes[d] = groupes[d] || []).push(r);
        }
        return groupes;
    }

    static extraireScore(rapport) {
        if (!rapport.analyseurs) return 100;
        const cohesion = rapport.analyseurs.find(a => a.metriques && a.metriques.scoreDeCohesion !== undefined);
        return cohesion ? cohesion.metriques.scoreDeCohesion : 100;
    }

    static estBloquant(rapport, score) {
        if (score < 50) return true;
        if (!rapport.analyseurs) return false;
        return rapport.analyseurs.some(a =>
            a.violations && a.violations.some(v => v.type === 'TAILLE_FICHIER')
        );
    }
}

export default UtilitairesRapporteur;
