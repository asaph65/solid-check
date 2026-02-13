/**
 * AIManager - Gestionnaire universel d'assistants IA pour SOLID-Check
 * 
 * Cette classe est agnostique de l'éditeur (VS Code, Antigravity, etc.)
 * et centralise la logique de détection et de génération de prompts.
 */
export class AIManager {
    constructor(promptGenerator) {
        this.promptGenerator = promptGenerator;
        this.assistantsDetected = [];
    }

    /**
     * Détecte les assistants IA disponibles via un environnement donné
     * @param {Object} env - Interface de l'environnement (ex: vscode API ou objet simulant)
     * @returns {Promise<Array>} Liste des assistants détectés
     */
    async detectAssistants(env) {
        const assistants = [];

        // GitHub Copilot
        if (this._hasExtension(env, 'github.copilot-chat') || this._hasExtension(env, 'github.copilot')) {
            assistants.push({
                id: 'copilot',
                name: 'GitHub Copilot Chat',
                icon: '🤖',
                command: 'workbench.action.chat.open'
            });
        }

        // Cursor AI
        if (this._isCursor(env)) {
            assistants.push({
                id: 'cursor',
                name: 'Cursor AI',
                icon: '⚡',
                usesNativeChat: true
            });
        }

        // Continue.dev
        if (this._hasExtension(env, 'continue.continue')) {
            assistants.push({
                id: 'continue',
                name: 'Continue',
                icon: '🔄',
                command: 'continue.continueGUIView.focus'
            });
        }

        // Codeium
        if (this._hasExtension(env, 'Codeium.codeium') || this._hasExtension(env, 'codeium.codeium')) {
            assistants.push({
                id: 'codeium',
                name: 'Codeium Chat',
                icon: '💬',
                command: 'codeium.chat'
            });
        }

        // Claude Dev / Roo Code
        const claudeDev = this._hasExtension(env, 'saoudrizwan.claude-dev') ||
            this._hasExtension(env, 'rooveterinaryinc.roo-cline');
        if (claudeDev) {
            assistants.push({
                id: 'claude-dev',
                name: 'Claude Dev / Roo Code',
                icon: '🎭',
                command: 'claude-dev.plusButtonClicked'
            });
        }

        // Fallback universel
        assistants.push({
            id: 'clipboard',
            name: 'Copier le prompt (pour tout agent IA)',
            icon: '📋',
            isClipboard: true
        });

        this.assistantsDetected = assistants;
        return assistants;
    }

    /**
     * Génère un prompt complet pour une analyse donnée
     */
    generatePrompt(analysis) {
        if (!this.promptGenerator) {
            throw new Error("Générateur de prompts non initialisé.");
        }
        return this.promptGenerator.generatePrompt(analysis);
    }

    // -- Méthodes privées utilitaires agnostiques --

    _hasExtension(env, id) {
        if (!env || !env.extensions) return false;
        // Supporte l'API VS Code (getExtension) et les structures d'objets simples
        if (typeof env.extensions.getExtension === 'function') {
            return !!env.extensions.getExtension(id);
        }
        return !!env.extensions[id];
    }

    _isCursor(env) {
        // Détection environnementale Cursor
        if (typeof process !== 'undefined' && process.env && process.env.CURSOR_APP_VERSION) return true;
        if (env && env.appName && env.appName.includes('Cursor')) return true;
        return false;
    }
}
