export class RefactoringPromptGenerator {
    /**
     * Génère un prompt optimisé pour n'importe quel agent IA
     */
    generatePrompt(codeAnalysis) {
        const { code, violations, metrics, context, suggestions } = codeAnalysis;

        return `# 🔧 REFACTORISATION SOLID - Assistant IA

Tu es un expert en architecture logicielle et principes SOLID pour JavaScript/TypeScript.

## 📊 ANALYSE DU CODE ACTUEL

**Fichier analysé:** \`${context.fileName}\`
**Type de composant:** ${context.type} (Pattern: ${context.pattern})

### Métriques de qualité
${this.formatMetrics(metrics)}

### Violations SOLID détectées
${this.formatViolations(violations)}

### Suggestions de refactorisation
${this.formatSuggestions(suggestions)}

---

## 📝 CODE À REFACTORISER

\`\`\`${context.language || 'javascript'}
${code}
\`\`\`

---

## 🎯 TA MISSION

Refactorise ce code en respectant les principes SOLID, en tenant compte du contexte **${context.type}**.

### Règles spécifiques au ${context.type}
${this.getContextRules(context.type)}

### Instructions de refactorisation

1. **Sépare les responsabilités** en classes/modules distincts selon les violations détectées
2. **Préserve la cohésion** : garde ensemble ce qui change ensemble
3. **Nomme clairement** chaque nouvelle classe selon sa responsabilité unique
4. **Maintiens les interfaces publiques** pour ne pas casser le code existant
5. **Ajoute des commentaires JSDoc** pour expliquer les responsabilités
6. **Fournis un fichier index** si tu crées plusieurs modules

### Format de réponse attendu

Organise ta réponse ainsi :

1. **📋 Stratégie de refactorisation** (2-3 phrases expliquant l'approche)
2. **📁 Structure des fichiers** (liste des fichiers à créer)
3. **💻 Code refactorisé** (code complet de chaque fichier)
4. **🔄 Guide de migration** (étapes pour migrer le code existant)
5. **📈 Améliorations obtenues** (estimation cohésion, nombre de responsabilités)

### Contraintes importantes
- Utilise des imports/exports ES6
- Respecte les conventions de nommage du projet
- Le code doit être production-ready
- Ajoute des tests unitaires si pertinent
- **Si tu es un Agent IA (Copilot, Cursor, etc.)** : Tu peux proposer de créer les nouveaux fichiers directement si l'utilisateur le permet, ou fournir le code bloc par bloc.

${this.getAdditionalContext(context)}
`;
    }

    formatMetrics(metrics) {
        if (!metrics) return '- *Métriques non disponibles*';
        const cohesionEmoji = metrics.cohesion >= 80 ? '✅' : metrics.cohesion >= 60 ? '⚠️' : '❌';

        return `
- **Cohésion (LCOM):** ${metrics.cohesion}% ${cohesionEmoji}
- **Lignes de code:** ${metrics.linesOfCode}
- **Nombre de méthodes:** ${metrics.methodCount}
- **Complexité cyclomatique:** ${metrics.complexity || 'N/A'}
- **Responsabilités détectées:** ${metrics.responsibilitiesCount || 'N/A'}
`.trim();
    }

    formatViolations(violations) {
        if (!violations || violations.length === 0) {
            return '✅ Aucune violation majeure détectée';
        }

        return violations.map(v => {
            let section = `\n#### ${v.principle || v.type} - ${v.severity === 'error' || v.gravite === 'ERREUR' ? '❌' : '⚠️'} ${v.title || v.message}\n`;
            section += `**Problème:** ${v.message}\n`;

            if (v.responsibilities && v.responsibilities.length > 0) {
                section += `**Responsabilités mélangées:** ${v.responsibilities.join(', ')}\n`;
            }

            if (v.affectedMethods && v.affectedMethods.length > 0) {
                section += `**Méthodes concernées:** ${v.affectedMethods.slice(0, 5).join(', ')}${v.affectedMethods.length > 5 ? '...' : ''}\n`;
            }

            if (v.details) {
                section += `**Détails:** ${typeof v.details === 'string' ? v.details : JSON.stringify(v.details)}\n`;
            }

            return section;
        }).join('\n');
    }

    formatSuggestions(suggestions) {
        if (!suggestions || suggestions.length === 0) {
            return '*Aucune suggestion automatique disponible*';
        }

        return suggestions.map((s, i) =>
            `${i + 1}. **${s.title}**\n   ${s.description}\n   *Impact:* ${s.impact}`
        ).join('\n\n');
    }

    getContextRules(type) {
        const rules = {
            'Service': `
- Les Services doivent avoir UNE seule responsabilité métier claire
- Délègue la persistence aux Repositories
- Délègue les validations à des Validators dédiés  
- Sépare la logique de notification dans des NotificationServices
- **Objectif de cohésion:** > 80%`,

            'Repository': `
- Les Repositories peuvent contenir plusieurs méthodes CRUD cohésives
- Toutes les méthodes doivent manipuler la même entité/ressource
- Acceptable d'avoir 15-30 méthodes si elles sont cohésives
- **Objectif de cohésion:** > 70%`,

            'Controller': `
- Les Controllers orchestrent mais ne contiennent pas de logique métier
- Chaque action doit déléguer au Service approprié
- Garde les controllers minces (thin controllers)
- **Objectif de cohésion:** > 60%`,

            'Utility': `
- Les Utilities peuvent avoir plusieurs fonctions utilitaires
- Groupe par domaine fonctionnel (ex: DateUtils, StringUtils)
- Préfère les fonctions pures sans état
- **Objectif de cohésion:** > 50%`,

            'Model': `
- Les Models/Entités doivent rester simples (données + getters/setters)
- Pas de logique métier complexe
- Méthodes de validation simple acceptables
- **Objectif de cohésion:** > 60%`
        };

        return rules[type] || rules['Service'];
    }

    getAdditionalContext(context) {
        let additional = '';

        if (context.framework) {
            additional += `\n### Framework détecté: ${context.framework}\n`;
            additional += `Respecte les conventions et patterns de ${context.framework}\n`;
        }

        if (context.dependencies && context.dependencies.length > 0) {
            additional += `\n### Dépendances utilisées\n`;
            additional += context.dependencies.map(d => `- ${d}`).join('\n');
        }

        return additional;
    }

    /**
     * Version compacte pour chat rapide
     */
    generateQuickPrompt(codeAnalysis) {
        const { code, violations, metrics } = codeAnalysis;

        return `Refactorise ce code selon SOLID. 
Cohésion actuelle: ${metrics.cohesion}% | Violations: ${violations.map(v => v.principle || v.type).join(', ')}

\`\`\`javascript
${code}
\`\`\``;
    }
}
