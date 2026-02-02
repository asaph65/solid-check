/**
 * Fichier de Test pour l'Analyseur de Cohésion
 * 
 * Ce fichier contient intentionnellement plusieurs violations du SRP
 * pour tester le DetecteurDeResponsabilite.
 */

class GestionnaireUtilisateurEtEmail {
    constructor() {
        this._utilisateurs = [];
        this._emails = [];
        this._compteur = 0;
        this._cache = {};
        this._logs = [];
    }

    // Violation 1 : Ratio ET - fonction avec conjonction
    sauvegarderEtEnvoyerEmail(utilisateur, message) {
        this._utilisateurs.push(utilisateur);
        this._emails.push(message);
        console.log('Utilisateur sauvegardé et email envoyé');
    }

    // Violation 2 : Diversité des Verbes - domaines différents
    calculerTVA(montant) {
        return montant * 0.2;
    }

    supprimerUtilisateur(id) {
        this._utilisateurs = this._utilisateurs.filter(u => u.id !== id);
    }

    afficherDashboard() {
        console.log('Dashboard affiché');
    }

    envoyerNotification(message) {
        console.log('Notification envoyée:', message);
    }

    // Violation 3 : Fonction trop longue (> 20 lignes)
    traiterCommandeComplexe(commande) {
        // Ligne 1
        console.log('Début du traitement');
        // Ligne 2
        const validation = this.validerCommande(commande);
        // Ligne 3
        if (!validation) {
            // Ligne 4
            return false;
            // Ligne 5
        }
        // Ligne 6
        const montant = this.calculerMontant(commande);
        // Ligne 7
        const tva = this.calculerTVA(montant);
        // Ligne 8
        const total = montant + tva;
        // Ligne 9
        console.log('Total calculé:', total);
        // Ligne 10
        this.sauvegarderCommande(commande);
        // Ligne 11
        this.envoyerConfirmation(commande.email);
        // Ligne 12
        this.mettreAJourStock(commande.produits);
        // Ligne 13
        this.genererFacture(commande);
        // Ligne 14
        this.envoyerNotification('Commande traitée');
        // Ligne 15
        this._logs.push('Commande ' + commande.id);
        // Ligne 16
        this._compteur++;
        // Ligne 17
        console.log('Traitement terminé');
        // Ligne 18
        return true;
        // Ligne 19
        // Ligne 20
        // Ligne 21
        // Ligne 22
    }

    validerCommande(commande) {
        return commande && commande.id;
    }

    calculerMontant(commande) {
        return 100;
    }

    sauvegarderCommande(commande) {
        this._cache[commande.id] = commande;
    }

    envoyerConfirmation(email) {
        console.log('Confirmation envoyée à', email);
    }

    mettreAJourStock(produits) {
        console.log('Stock mis à jour');
    }

    genererFacture(commande) {
        console.log('Facture générée');
    }
}

export default GestionnaireUtilisateurEtEmail;
