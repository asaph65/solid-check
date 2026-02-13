import path from 'path';
import FormatteurANSI from './formatteur-ansi.js';
import CalculateurScore from './calculateur-score.js';
import UtilitairesRapporteur from './utilitaires-rapporteur.js';

/**
 * Rapporteur Console (Version Standardisée)
 * Affichage professionnel, sans emojis excessifs.
 */
class RapporteurConsole {
    static instance = null;

    constructor() {
        if (RapporteurConsole.instance) return RapporteurConsole.instance;
        RapporteurConsole.instance = this;
    }

    static obtenirInstance() {
        return RapporteurConsole.instance || new RapporteurConsole();
    }

    genererRapport(resultat) {
        console.log(FormatteurANSI.banniere());
        const dossierGroupes = UtilitairesRapporteur.grouperParDossier(resultat.rapports);
        let violationsTotal = 0;
        let aBloquant = false;

        for (const [dossier, rapports] of Object.entries(dossierGroupes)) {
            this._afficherDossier(dossier);
            for (const rapport of rapports) {
                if (this._afficherFichier(rapport)) aBloquant = true;
                violationsTotal += rapport.nombreViolations;
            }
            console.log('');
        }

        this._afficherResume(resultat.nombreFichiers, violationsTotal, aBloquant);
        return !aBloquant;
    }

    _afficherDossier(dossier) {
        const { CYAN, GRAS, RESET } = FormatteurANSI.COULEURS;
        const nom = path.relative(process.cwd(), dossier) || '.';
        console.log(`${CYAN}${GRAS}[MODULE] ${nom}${RESET}`);
        console.log(`${CYAN}────────────────────────────────────────────────────────────────────────────${RESET}`);
    }

    _afficherFichier(rapport) {
        const score = UtilitairesRapporteur.extraireScore(rapport);
        const estBloquant = UtilitairesRapporteur.estBloquant(rapport, score);
        const C = FormatteurANSI.COULEURS;

        // Extraire les métriques du smart analyzer
        const smart = rapport.analyseurs.find(a => a.metriques && a.metriques.cohesion !== undefined) || {};
        const ctx = smart.contexte || 'GENERIC';
        const cohesion = smart.metriques?.cohesion ?? 100;

        const clr = estBloquant ? C.ROUGE : (cohesion > 80 ? C.VERT : C.JAUNE);
        const statusTxt = estBloquant ? 'VIOLATION SRP' : (cohesion > 80 ? 'COHESIF' : 'MOYEN');

        console.log(`  ${C.GRIS}*${C.RESET} ${path.basename(rapport.fichier).padEnd(35)} ${C.GRIS}│${C.RESET} ${clr}${statusTxt.padEnd(15)}${C.RESET} ${C.GRIS}│${C.RESET} Ctx: ${ctx.padEnd(12)} ${C.GRIS}│${C.RESET} Cohésion: ${cohesion}%`);

        for (const a of rapport.analyseurs) {
            if (a.violations) {
                for (const v of a.violations) {
                    const tag = v.severite === 'error' ? '[!]' : '[WARN]';
                    console.log(`    ${C.GRIS}└─ ${tag} ${v.raison || v.message} : ${v.suggestion || ''}${C.RESET}`);
                }
            }
        }
        return estBloquant;
    }

    _afficherResume(nbFiles, nbViolations, aBloquant) {
        const note = CalculateurScore.calculer(nbFiles, nbViolations, aBloquant);
        const C = FormatteurANSI.COULEURS;

        console.log(`\n${C.BLEU}══════════════════════════════════════════════════════════════════════════════${C.RESET}`);
        console.log(`  ${C.GRAS}RÉSUMÉ DU VERDICT${C.RESET}`);
        console.log(`${C.BLEU}══════════════════════════════════════════════════════════════════════════════${C.RESET}`);
        console.log(`  > Fichiers analysés      : ${nbFiles}`);
        console.log(`  > Violations détectées   : ${nbViolations > 0 ? C.JAUNE : C.VERT}${nbViolations}${C.RESET}`);
        console.log(`  > Note de Santé Globale  : ${C.GRAS}${note >= 15 ? C.VERT : C.JAUNE}${note}/20${C.RESET}`);
        console.log(`${C.BLEU}══════════════════════════════════════════════════════════════════════════════${C.RESET}`);

        const msg = aBloquant ? `${C.ROUGE}[ECHEC]` : `${C.VERT}[SUCCES]`;
        console.log(`\n${C.GRAS}${msg} Architecture ${aBloquant ? 'non conforme' : 'validée'}.${C.RESET}\n`);
    }
}

export default RapporteurConsole;
