import AnalyseurDeCohesion from '../services/analyseur-cohesion/index.js';

/**
 * Analyse un fichier et retourne les violations et métriques pour l'IA
 */
export async function analyzeFile(code, filePath) {
    const cohesionAnalyzer = new AnalyseurDeCohesion();
    const analysis = await cohesionAnalyzer.analyser(filePath, code, {});

    return {
        hasViolations: analysis.violations.length > 0,
        violations: analysis.violations,
        metrics: {
            cohesion: analysis.metriques?.cohesion || 0,
            linesOfCode: code.split('\n').length,
            methodCount: analysis.metriques?.methodes || 0
        },
        context: {
            type: analysis.metriques?.contexte || 'Service',
            fileName: filePath
        }
    };
}
