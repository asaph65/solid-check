import * as vscode from 'vscode';
import path from 'path';
import { NotificationService } from './NotificationService.js';
import { AIRefactoringService } from '../../src-core/ai/ai-refactoring-service.js';

/**
 * Service d'orchestration pour les refactorisations IA.
 * Responsabilité : Gérer les différents fournisseurs d'IA et formater les prompts.
 */
export class AIOrchestratorService {
    constructor(extensionPath) {
        this.extensionPath = extensionPath;
    }

    /**
     * Exécute une refactorisation via le fournisseur configuré.
     * @param {vscode.TextDocument} document 
     * @param {vscode.Range} range 
     * @param {vscode.Diagnostic} diagnostic 
     * @returns {Promise<any>} Résultat normalisé
     */
    async refactor(document, range, diagnostic) {
        const config = vscode.workspace.getConfiguration('solidCheck');
        const provider = config.get('aiProvider') || 'vscode-lm';
        const prompt = await this._buildPrompt(document, range, diagnostic);

        const response = await NotificationService.withProgress(
            "SOLID-Check : Refactorisation en cours...",
            () => this._callProvider(provider, prompt, config)
        );

        return this._normalizeResponse(response, document);
    }

    async _callProvider(provider, prompt, config) {
        switch (provider) {
            case 'gemini-api': return await this._callGemini(prompt, config);
            case 'anthropic-api': return await this._callAnthropic(prompt, config);
            case 'ollama': return await this._callOllama(prompt, config);
            default: return await this._callVSCodeLM(prompt, config);
        }
    }

    /**
     * Exécute une refactorisation via le service core (Anthropic).
     */
    async refactorWithCoreService(document, diagnostics) {
        const config = vscode.workspace.getConfiguration('solidCheck');
        const apiKey = config.get('anthropicApiKey');
        if (!apiKey) throw new Error("Clé API Anthropic manquante.");

        const aiService = new AIRefactoringService(apiKey);
        const analysis = this._prepareAnalysis(document, diagnostics);

        const response = await NotificationService.withProgress(
            "SOLID-Check : Analyse et Refactorisation IA...",
            () => aiService.refactorCode(analysis)
        );

        return this._normalizeCoreResponse(response);
    }

    _prepareAnalysis(document, diagnostics) {
        return {
            code: document.getText(),
            violations: diagnostics.map(d => ({
                type: d.code || 'VIOLATION_SRP',
                message: d.message,
                details: {}
            })),
            metrics: { cohesion: 0, linesOfCode: document.lineCount, methodCount: 0 },
            context: { type: 'Service', fileName: document.fileName }
        };
    }

    _normalizeResponse(response, document) {
        if (response.actions) {
            return {
                strategy: response.strategy || "Refactorisation de code",
                files: response.actions.map(a => ({
                    path: a.file || document.fileName,
                    content: a.content,
                    purpose: a.type
                }))
            };
        }
        return response;
    }

    _normalizeCoreResponse(response) {
        return {
            strategy: response.strategy,
            files: response.files
        };
    }

    async _buildPrompt(document, range, diagnostic) {
        const code = document.getText(range);
        const diagnosticMessage = diagnostic ? diagnostic.message : 'Violation de principe SOLID';

        let template = `Tu es un expert en Clean Code et principes SOLID.
Refactorise le code fourni pour corriger une violation spécifique.
Format de Sortie : JSON uniquement.
{
  "strategy": "...",
  "actions": [
    { "type": "REPLACE", "file": "{fileName}", "content": "nouveau contenu" }
  ]
}
Problème : {diagnostic}
Code :
{code}`;

        return template
            .replace('{diagnostic}', diagnosticMessage)
            .replace('{fileName}', document.fileName)
            .replace('{code}', code);
    }

    async _callGemini(prompt, config) {
        const apiKey = config.get('geminiApiKey');
        const model = config.get('geminiModel') || 'gemini-1.5-flash';
        if (!apiKey) throw new Error("Clé API Gemini manquante.");

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });

        if (!response.ok) throw new Error(`Erreur API Gemini: ${response.statusText}`);
        const data = await response.json();
        return this._cleanResponse(data.candidates[0].content.parts[0].text);
    }

    async _callAnthropic(prompt, config) {
        const apiKey = config.get('anthropicApiKey');
        const model = config.get('anthropicModel') || 'claude-3-5-sonnet-20240620';
        if (!apiKey) throw new Error("Clé API Anthropic manquante.");

        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: model,
                max_tokens: 4096,
                messages: [{ role: 'user', content: prompt }]
            })
        });

        if (!response.ok) throw new Error(`Erreur API Anthropic: ${response.statusText}`);
        const data = await response.json();
        return this._cleanResponse(data.content[0].text);
    }

    async _callOllama(prompt, config) {
        const endpoint = config.get('ollamaEndpoint') || 'http://localhost:11434/api/generate';
        const model = config.get('ollamaModel') || 'llama3';

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ model: model, prompt: prompt, stream: false })
        });

        if (!response.ok) throw new Error(`Erreur Ollama: ${response.statusText}`);
        const data = await response.json();
        return this._cleanResponse(data.response);
    }

    async _callVSCodeLM(prompt, config) {
        const model = await this._selectModel(config);
        const message = [vscode.LanguageModelChatMessage.User(prompt)];
        const response = await model.sendRequest(message, {}, new vscode.CancellationTokenSource().token);

        let text = '';
        for await (const chunk of response.text) { text += chunk; }
        return this._cleanResponse(text);
    }

    async _selectModel(config) {
        const families = ['gpt-4o', 'gpt-4', 'gemini-1.5-pro', 'claude-3-5-sonnet'];
        for (const family of families) {
            const models = await vscode.lm.selectChatModels({ family });
            if (models.length > 0) return models[0];
        }
        const allModels = await vscode.lm.selectChatModels();
        if (allModels.length > 0) return allModels[0];
        throw new Error("Aucun modèle d'IA disponible via VS Code.");
    }

    _cleanResponse(text) {
        text = text.trim();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error("Format de réponse IA invalide (JSON attendu).");
        return JSON.parse(jsonMatch[0]);
    }
}
