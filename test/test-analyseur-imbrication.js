import AnalyseurImbrication from '../src/services/detecteur-complexite/analyseurs/analyseur-imbrication.js';

console.log('🧪 Test de l\'Analyseur d\'Imbrication\n');

// Test 1: Code avec imbrication acceptable
const codeSimple = `
function traiterUtilisateur(user) {
    if (user) {
        if (user.actif) {
            return user.nom;
        }
    }
    return null;
}
`;

console.log('📝 Test 1: Code avec imbrication acceptable (niveau 3)');
const analyseur = new AnalyseurImbrication();
const resultat1 = analyseur.analyser(codeSimple, 4);
console.log('Conforme:', resultat1.conforme);
console.log('Profondeur maximale:', resultat1.profondeurMaximale);
console.log('Violations:', resultat1.nombreViolations);
console.log('');

// Test 2: Code avec imbrication excessive
const codeComplexe = `
function traiterCommande(commande) {
    if (commande) {
        if (commande.valide) {
            for (let item of commande.items) {
                if (item.disponible) {
                    if (item.stock > 0) {
                        if (item.prix > 0) {
                            console.log('Traitement item');
                        }
                    }
                }
            }
        }
    }
}
`;

console.log('📝 Test 2: Code avec imbrication excessive (niveau 7)');
const resultat2 = analyseur.analyser(codeComplexe, 4);
console.log('Conforme:', resultat2.conforme);
console.log('Profondeur maximale:', resultat2.profondeurMaximale);
console.log('Nombre de violations:', resultat2.nombreViolations);
console.log('\nViolations détectées:');
resultat2.violations.forEach((v, i) => {
    console.log(`  ${i + 1}. ${v.message} (profondeur: ${v.profondeur})`);
});
console.log('');

// Test 3: Code avec plusieurs blocs imbriqués
const codeMultiple = `
class GestionnaireCommandes {
    traiterCommandes(commandes) {
        for (let cmd of commandes) {
            if (cmd.prioritaire) {
                if (cmd.client) {
                    if (cmd.client.premium) {
                        if (cmd.montant > 1000) {
                            if (cmd.paiement.valide) {
                                this.traiterPrioritaire(cmd);
                            }
                        }
                    }
                }
            }
        }
    }
    
    validerStock(items) {
        for (let item of items) {
            if (item.stock) {
                if (item.stock.quantite > 0) {
                    if (item.stock.reserve) {
                        if (item.stock.reserve.disponible) {
                            if (item.stock.reserve.delai < 7) {
                                return true;
                            }
                        }
                    }
                }
            }
        }
        return false;
    }
}
`;

console.log('📝 Test 3: Code avec plusieurs blocs imbriqués');
const resultat3 = analyseur.analyser(codeMultiple, 4);
console.log('Conforme:', resultat3.conforme);
console.log('Profondeur maximale:', resultat3.profondeurMaximale);
console.log('Nombre de violations:', resultat3.nombreViolations);
console.log('\nViolations détectées:');
resultat3.violations.forEach((v, i) => {
    console.log(`  ${i + 1}. ${v.message}`);
});
console.log('');

console.log('✅ Tests terminés');
