
// Fichier de test avec beaucoup de violations SOLID pour vérifier l'extension

// Violation SRP (Single Responsibility Principle) et Taille
class GestionnaireToutEnUn {
    constructor() {
        this.utilisateurs = [];
        this.produits = [];
        this.commandes = [];
    }

    // Fonction trop longue et complexe
    traiterTout(type, donnee) {
        if (type === 'USER') {
            if (donnee.nom) {
                if (donnee.age > 18) {
                    this.utilisateurs.push(donnee);
                    console.log("Utilisateur ajouté");
                    // Logique d'email mélangée
                    this.envoyerEmail(donnee.email, "Bienvenue");
                } else {
                    throw new Error("Trop jeune");
                }
            }
        } else if (type === 'PRODUCT') {
            if (donnee.prix > 0) {
                this.produits.push(donnee);
                // Logique de stock mélangée
                if (donnee.quantite < 5) {
                    console.warn("Stock bas");
                }
            }
        }
    }

    envoyerEmail(to, sujet) {
        console.log(`Envoi à ${to}: ${sujet}`);
    }

    // Trop de paramètres
    creerCommande(id, client, articles, adresse, date, methodePaiement, coupon, estCadeau) {
        const commande = { id, client, articles, adresse, date, methodePaiement, coupon, estCadeau };
        this.commandes.push(commande);
        return commande;
    }
}

// Fonction globale avec trop de niveaux d'imbrication
function fonctionTresImbriquee(a, b, c) {
    if (a) {
        if (b) {
            for (let i = 0; i < 10; i++) {
                if (c) {
                    while (a > 0) {
                        if (i % 2 === 0) {
                            console.log(i);
                        }
                        a--;
                    }
                }
            }
        }
    }
}
