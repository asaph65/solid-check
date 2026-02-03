import AnalyseurNommage from '../src/services/analyseur-universel/strategies/analyseur-nommage.js';

console.log('🧪 Test de l\'Analyseur de Nommage\n');

// Test 1: Code avec conventions correctes
const codeCorrect = `
function calculerTotal(montant, taxe) {
    const TAUX_TVA = 0.20;
    let resultat = montant * (1 + TAUX_TVA);
    return resultat;
}

class UtilisateurService {
    constructor() {
        this.utilisateurs = [];
    }
}
`;

console.log('📝 Test 1: Code avec conventions correctes');
const resultat1 = AnalyseurNommage.analyser(codeCorrect, '(?:function|class)\\s+([a-zA-Z_$][a-zA-Z0-9_$]*)');
console.log('Conforme:', resultat1.conforme);
console.log('Violations:', resultat1.violations.length);
console.log('Stats:', {
    fonctions: resultat1.nombreFonctions,
    variables: resultat1.nombreVariables,
    constantes: resultat1.nombreConstantes
});
console.log('');

// Test 2: Code avec violations de nommage
const codeIncorrect = `
function CalculTotal(montant, taxe) {
    const taux_tva = 0.20;
    let Resultat = montant * (1 + taux_tva);
    return Resultat;
}

function traiterDonnees() {
    const ma_constante = 100;
    let variable_test = 50;
    return ma_constante + variable_test;
}
`;

console.log('📝 Test 2: Code avec violations de nommage');
const resultat2 = AnalyseurNommage.analyser(codeIncorrect, '(?:function|class)\\s+([a-zA-Z_$][a-zA-Z0-9_$]*)');
console.log('Conforme:', resultat2.conforme);
console.log('Nombre de violations:', resultat2.violations.length);
console.log('\nViolations détectées:');
resultat2.violations.forEach((v, i) => {
    console.log(`  ${i + 1}. [${v.categorie}] ${v.element}: ${v.message}`);
});
console.log('');

// Test 3: Fonctions sans verbes d'action
const codeSansVerbes = `
function total(a, b) {
    return a + b;
}

function donnees() {
    return [];
}

function calculerSomme(x, y) {
    return x + y;
}
`;

console.log('📝 Test 3: Fonctions sans verbes d\'action');
const resultat3 = AnalyseurNommage.analyser(codeSansVerbes, '(?:function|class)\\s+([a-zA-Z_$][a-zA-Z0-9_$]*)');
console.log('Conforme:', resultat3.conforme);
console.log('Violations:', resultat3.violations.length);
console.log('\nViolations détectées:');
resultat3.violations.forEach((v, i) => {
    console.log(`  ${i + 1}. ${v.message}`);
});
console.log('');

console.log('✅ Tests terminés');
