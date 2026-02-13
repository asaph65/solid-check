import { AIRefactoringService } from '../ai/ai-refactoring-service.js';
import { analyzeFile } from '../analyzer/index.js';
import fs from 'fs/promises';

export async function refactorCommand(filePath, options) {
    try {
        console.log(`🔍 Analyse de : ${filePath}`);

        const code = await fs.readFile(filePath, 'utf-8');
        const analysis = await analyzeFile(code, filePath);

        if (!analysis.hasViolations) {
            console.log('✅ Aucune violation SRP détectée - pas de refactorisation nécessaire.');
            return;
        }

        console.log(`\n🤖 Refactorisation IA en cours pour ${filePath}...\n`);

        const apiKey = process.env.ANTHROPIC_API_KEY || options.apiKey;
        if (!apiKey) {
            console.error('❌ Erreur : Clé API Anthropic manquante (ANTHROPIC_API_KEY).');
            return;
        }

        const aiService = new AIRefactoringService(apiKey);

        const refactoring = await aiService.refactorCode({
            code,
            violations: analysis.violations,
            metrics: analysis.metrics,
            context: analysis.context
        });

        console.log(`\n📋 Stratégie : ${refactoring.strategy}\n`);

        if (options.preview) {
            refactoring.files.forEach(f => {
                console.log(`\n${'='.repeat(40)}`);
                console.log(`📄 FICHIER : ${f.path}`);
                console.log(`💡 BUT : ${f.purpose}`);
                console.log(`${'='.repeat(40)}\n`);
                console.log(f.content);
                console.log(`\n${'='.repeat(40)}\n`);
            });
        }

        if (options.apply) {
            for (const file of refactoring.files) {
                // Caution: This might overwrite files. 
                // In a real CLI we would probably ask for confirmation or write to a diff/temporary area.
                await fs.writeFile(file.path, file.content);
                console.log(`✅ Créé/Mis à jour : ${file.path}`);
            }
        }
    } catch (error) {
        console.error(`❌ Erreur lors de la refactorisation : ${error.message}`);
    }
}
