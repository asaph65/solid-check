import Anthropic from '@anthropic-ai/sdk';

export class AIRefactoringService {
    constructor(apiKey) {
        if (!apiKey) {
            throw new Error('Anthropic API Key is required for AI refactoring.');
        }
        this.client = new Anthropic({ apiKey });
    }

    async refactorCode(codeAnalysis) {
        const prompt = this.buildRefactoringPrompt(codeAnalysis);

        try {
            const message = await this.client.messages.create({
                model: "claude-3-5-sonnet-20240620", // Updating to a real available model name
                max_tokens: 4000,
                messages: [{
                    role: "user",
                    content: prompt
                }]
            });

            return this.parseRefactoringResponse(message.content[0].text);
        } catch (error) {
            throw new Error(`Erreur lors de l'appel à Anthropic: ${error.message}`);
        }
    }

    buildRefactoringPrompt(analysis) {
        const { code, violations, metrics, context } = analysis;

        return `Tu es un expert en refactorisation SOLID pour JavaScript/TypeScript.

# ANALYSE DU CODE ACTUEL

**Type de composant:** ${context.type} (${context.pattern || 'N/A'})
**Fichier:** ${context.fileName}

## Métriques
- **Cohésion (LCOM):** ${metrics.cohesion}% ${metrics.cohesion < 60 ? '❌ FAIBLE' : metrics.cohesion < 80 ? '⚠️ MOYEN' : '✅ BON'}
- **Lignes de code:** ${metrics.linesOfCode}
- **Nombre de méthodes:** ${metrics.methodCount}
- **Responsabilités détectées:** ${violations.responsibilities?.join(', ') || 'N/A'}

## Violations SOLID détectées
${this.formatViolations(violations)}

## Code à refactoriser
\`\`\`javascript
${code}
\`\`\`

# TA MISSION

Refactorise ce code en respectant les principes SOLID, en tenant compte du contexte (${context.type}).

## Règles spécifiques au contexte ${context.type}:
${this.getContextSpecificRules(context)}

## Instructions de refactorisation

1. **Sépare les responsabilités** en classes/modules distincts
2. **Préserve la cohésion** : garde ensemble ce qui change ensemble
3. **Nomme clairement** chaque nouvelle classe selon sa responsabilité unique
4. **Maintiens les interfaces publiques** pour éviter de casser le code client
5. **Ajoute des commentaires** expliquant les choix architecturaux

## Format de réponse OBLIGATOIRE

Réponds UNIQUEMENT avec ce format JSON (pas de markdown, pas de texte avant/après):

{
  "strategy": "Description de la stratégie de refactorisation (2-3 phrases)",
  "files": [
    {
      "path": "chemin/du/fichier.js",
      "content": "// Code complet du fichier",
      "purpose": "Responsabilité de ce fichier (ex: 'Gestion CRUD des utilisateurs')"
    }
  ],
  "migration": {
    "breaking_changes": false,
    "steps": [
      "Étape 1: ...",
      "Étape 2: ..."
    ]
  },
  "improvements": {
    "cohesion_estimate": 85,
    "responsibilities_count": 1,
    "justification": "Explication des améliorations"
  }
}`;
    }

    formatViolations(violations) {
        let result = '';

        const violationsList = Array.isArray(violations) ? violations : [violations];

        violationsList.forEach(v => {
            if (v.type === 'VIOLATION_SRP') {
                result += `\n### ❌ Violation du SRP (Single Responsibility Principle)
- **Problème:** ${v.message}
- **Détails:** ${JSON.stringify(v.details || {})}
`;
            } else {
                result += `\n### ⚠️ Violation: ${v.type}
- **Message:** ${v.message}
`;
            }
        });

        return result || '✅ Aucune violation majeure détectée';
    }

    getContextSpecificRules(context) {
        const rules = {
            'Service': `
- Les Services doivent avoir UNE seule responsabilité métier claire
- Délègue la persistence aux Repositories
- Délègue les validations à des Validators dédiés
- Sépare la logique de notification dans des NotificationServices
- Score de cohésion cible: > 80%`,

            'Repository': `
- Les Repositories peuvent contenir plusieurs méthodes CRUD cohésives
- Toutes les méthodes doivent manipuler la même entité/ressource
- Acceptable d'avoir 15-30 méthodes si elles sont cohésives
- Score de cohésion cible: > 70%`,

            'Controller': `
- Les Controllers orchestrent mais ne contiennent pas de logique métier
- Chaque action doit déléguer au Service approprié
- Acceptable d'avoir plusieurs endpoints si cohésifs
- Score de cohésion cible: > 60%`,

            'Utility': `
- Les Utilities peuvent avoir plusieurs fonctions utilitaires
- Groupe par domaine fonctionnel (ex: DateUtils, StringUtils)
- Acceptable d'avoir une cohésion plus faible (> 50%)`,

            'Model': `
- Les Models/Entités doivent rester simples (données + getters/setters)
- Pas de logique métier complexe
- Méthodes de validation simple acceptables`
        };

        return rules[context.type] || rules['Service'];
    }

    parseRefactoringResponse(response) {
        try {
            // Nettoie le response au cas où Claude ajoute du markdown
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('Format de réponse invalide');
            }

            return JSON.parse(jsonMatch[0]);
        } catch (error) {
            throw new Error(`Erreur parsing réponse IA: ${error.message}\n\nRéponse brute:\n${response}`);
        }
    }
}
