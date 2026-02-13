import * as vscode from 'vscode';
import path from 'path';
import fs from 'fs';

export class AIAssistantIntegration {
    constructor() {
        this.aiManager = null;
    }

    /**
     * Initialise le gestionnaire IA (chargement dynamique ESM)
     */
    async init(extensionPath) {
        if (this.aiManager) return;

        try {
            // Chemins vers le core
            const baseDir = path.join(extensionPath, 'src-core');
            const aiDir = path.join(baseDir, 'ai');

            // On essaie de charger les modules ESM
            const promptGenPath = path.join(aiDir, 'refactoring-prompt-generator.js');
            const managerPath = path.join(aiDir, 'ai-manager.js');

            const { RefactoringPromptGenerator } = await import('file://' + promptGenPath);
            const { AIManager } = await import('file://' + managerPath);

            this.aiManager = new AIManager(new RefactoringPromptGenerator());
            console.log('[SOLID-Check] IA Manager initialisé avec succès.');
        } catch (error) {
            console.error('[SOLID-Check] Erreur chargement Core IA:', error);
            // Fallback pour le dev local si src-core n'est pas encore synchronisé
            try {
                const devAiDir = path.join(extensionPath, '..', 'src', 'ai');
                const { RefactoringPromptGenerator } = await import('file://' + path.join(devAiDir, 'refactoring-prompt-generator.js'));
                const { AIManager } = await import('file://' + path.join(devAiDir, 'ai-manager.js'));
                this.aiManager = new AIManager(new RefactoringPromptGenerator());
            } catch (e) {
                console.error('[SOLID-Check] Échec total du chargement de l\'IA:', e);
                throw error;
            }
        }
    }

    /**
     * Affiche le menu de sélection d'agent IA
     */
    async showAIAssistantPicker(codeAnalysis) {
        if (!this.aiManager) {
            throw new Error("Générateur de prompts non initialisé.");
        }

        // Utilise le manager agnostique pour détecter les assistants via l'API vscode
        const assistants = await this.aiManager.detectAssistants(vscode);

        const quickPickItems = assistants.map(a => ({
            label: `${a.icon} ${a.name}`,
            description: a.usesNativeChat ? 'Utilise le chat natif' : '',
            assistant: a
        }));

        const selected = await vscode.window.showQuickPick(quickPickItems, {
            placeHolder: 'Choisissez votre agent IA pour refactoriser',
            title: '🤖 SOLID-Check - Refactorisation IA'
        });

        if (!selected) return;

        await this.sendToAssistant(selected.assistant, codeAnalysis);
    }

    /**
     * Envoie le prompt à l'agent IA sélectionné
     */
    async sendToAssistant(assistant, codeAnalysis) {
        if (!this.aiManager) {
            throw new Error("Générateur de prompts non initialisé.");
        }
        const prompt = this.aiManager.generatePrompt(codeAnalysis);

        switch (assistant.id) {
            case 'copilot':
                await this.sendToCopilot(prompt);
                break;

            case 'cursor':
                await this.sendToCursor(prompt);
                break;

            case 'continue':
                await this.sendToContinue(prompt);
                break;

            case 'codeium':
            case 'tabnine':
            case 'claude-dev':
            case 'amazon-q':
                await this.sendToGenericChat(assistant, prompt);
                break;

            case 'clipboard':
                await this.copyToClipboard(prompt, codeAnalysis);
                break;
        }
    }

    async sendToCopilot(prompt) {
        await vscode.commands.executeCommand('workbench.action.chat.open');
        await new Promise(resolve => setTimeout(resolve, 500));
        await vscode.env.clipboard.writeText(prompt);
        vscode.window.showInformationMessage(
            '✅ Prompt copié ! Collez-le (Cmd+V) dans GitHub Copilot Chat',
            'OK'
        );
    }

    async sendToCursor(prompt) {
        await vscode.env.clipboard.writeText(prompt);
        await vscode.window.showInformationMessage(
            '✅ Prompt copié ! Utilisez Cmd+L (ou Ctrl+L) pour ouvrir Cursor AI et collez le prompt',
            'OK'
        );
    }

    async sendToContinue(prompt) {
        await vscode.commands.executeCommand('continue.continueGUIView.focus');
        await vscode.env.clipboard.writeText(prompt);
        vscode.window.showInformationMessage(
            '✅ Prompt copié ! Collez-le dans Continue',
            'OK'
        );
    }

    async sendToGenericChat(assistant, prompt) {
        if (assistant.command) {
            try {
                await vscode.commands.executeCommand(assistant.command);
            } catch (error) {
                console.error(`Erreur ouverture ${assistant.name}:`, error);
            }
        }
        await vscode.env.clipboard.writeText(prompt);
        vscode.window.showInformationMessage(
            `✅ Prompt copié ! Collez-le dans ${assistant.name}`,
            'OK'
        );
    }

    async copyToClipboard(prompt, codeAnalysis) {
        await vscode.env.clipboard.writeText(prompt);
        const choice = await vscode.window.showInformationMessage(
            '📋 Prompt copié dans le presse-papier !',
            'Voir le prompt',
            'OK'
        );
        if (choice === 'Voir le prompt') {
            await this.showPromptPreview(prompt, codeAnalysis);
        }
    }

    async showPromptPreview(prompt, codeAnalysis) {
        const doc = await vscode.workspace.openTextDocument({
            content: prompt,
            language: 'markdown'
        });
        await vscode.window.showTextDocument(doc, {
            preview: true,
            viewColumn: vscode.ViewColumn.Beside
        });
    }

    async savePromptToFile(prompt, codeAnalysis) {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) return;
        const dirPath = vscode.Uri.joinPath(workspaceFolder.uri, '.solid-check', 'prompts');
        try {
            await vscode.workspace.fs.createDirectory(dirPath);
        } catch (e) { }
        const fileName = `refactor-${path.basename(codeAnalysis.context.fileName).replace(/[^a-z0-9]/gi, '-')}-${Date.now()}.prompt.md`;
        const uri = vscode.Uri.joinPath(dirPath, fileName);
        await vscode.workspace.fs.writeFile(uri, Buffer.from(prompt));
        return uri;
    }
}
