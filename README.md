# SOLID-Check

> Librairie d'analyse SOLID Intelligente pour JavaScript

## 🎯 Pourquoi SOLID-Check ?

L'approche traditionnelle de l'analyse statique est souvent trop rigide : un Repository de 150 lignes peut être parfaitement conforme s'il est cohésif, alors qu'un Service de 30 lignes peut violer le SRP s'il mélange trop de responsabilités.

**SOLID-Check** résout ce problème avec une **Analyse Intelligente** :
- **Cohésion > Taille** : Un score de cohésion (LCOM) élevé pardonne les fichiers longs.
- **Détection de Contexte** : Les règles s'adaptent selon si votre fichier est un Service, Repository, Controller, etc.
- **Analyse des Responsabilités** : Détection automatique des domaines fonctionnels (CRUD, Validation, Calcul, Notification).

## ✨ Fonctionnalités Clés

### 🧠 Analyseur de Cohésion (SRP)
Utilise l'algorithme **LCOM (Lack of Cohesion of Methods)** pour mesurer la dépendance interne entre vos méthodes et vos propriétés.
- Score de 0 à 100.
- Détecte les groupes de méthodes déconnectés qui devraient être séparés.

### 🕵️ Détecteur de Responsabilités
Analyse non seulement les noms des méthodes mais aussi leur corps pour identifier les mélanges de domaines :
- **CRUD** : Gestion des données (database, repository).
- **VALIDATION** : Vérification des règles métier.
- **NOTIFICATION** : Envoi d'emails ou notifications.
- **CALCUL** : Traitement de données complexe.

### 📍 Adaptation au Contexte
Le système identifie automatiquement le type de composant :
- **Repository** : Tolérance accrue pour le nombre de méthodes CRUD cohésives.
- **Service** : SRP strict requis pour la logique métier.
- **Controller** : Tolérance pour l'orchestration.
- **Utility** : Flexibilité sur la cohésion transversale.

## 🔌 Extension VS Code (SOLID-Check Assistant)

L'extension **SOLID-Check Assistant** apporte toute l'intelligence de la librairie directement dans votre flux de travail quotidien. Elle transforme votre éditeur en un véritable partenaire de conception logicielle.

### 🧠 Feedback en Temps Réel
- **Diagnostics Intelligents** : Les violations SOLID sont soulignées directement dans votre code.
- **Zéro Faux Positifs** : Grâce à l'analyse de cohésion (LCOM), vos gros fichiers bien organisés ne sont plus signalés comme des erreurs.
- **Score en Direct** : Visualisez instantanément la santé de vos composants.

### 🤖 Assistant IA & Refactorisation Automatique
L'extension intègre un orchestrateur IA capable de transformer vos violations SOLID en code propre en un clic.

1. **Quick Fix (Ampoule)** : Cliquez sur une violation soulignée.
2. **Refactoriser avec IA** : Choisissez cette option pour lancer l'orchestration.
3. **Multi-Agent Support** : Compatible avec **GitHub Copilot**, **Cursor**, **Claude Dev**, et plus encore.
4. **Prompting Intelligent** : L'extension génère un prompt ultra-précis incluant le contexte (Service, Repository, etc.) et les métriques de cohésion pour une refactorisation parfaite.

![SOLID-Check Extension Mockup](file:///home/n-dja-asaph/.gemini/antigravity/brain/b0248d50-b9f0-4bef-97ff-bc7f0c506c55/solid_check_extension_mockup_1770895140039.png)

### 🛠️ Installation & Configuration
Recherchez "SOLID-Check Assistant" dans le Marketplace VS Code ou installez-le via l'extension `.vsix`.

**Configuration recommandée (`settings.json`) :**
```json
{
  "solidCheck.aiProvider": "vscode-lm", // Utilise Copilot/Gemini natif
  "solidCheck.geminiApiKey": "VOTRE_CLE_ICI" // Optionnel pour accès direct
}
```

## 📦 Installation

```bash
npm install --save-dev solid-check
```

## 🚀 Utilisation

### CLI (Ligne de commande)

```bash
# Analyse simple
npx solid-check

# Avec configuration spécifique
npx solid-check --config config/solid-config-intelligente.json
```

### Configuration Intelligente

Créez un fichier `solid-config-intelligente.json` pour ajuster les seuils :

```json
{
  "detecteurs_srp": {
    "cohesion": {
      "score_minimum": 60,
      "severite": "error"
    },
    "categories_responsabilites": {
      "maximum": 3
    }
  },
  "regles_par_contexte": {
    "patterns": {
      "service": { "limites": { "cohesion_min": 80 } },
      "repository": { "limites": { "cohesion_min": 70 } }
    }
  }
}
```

## 📊 Exemple de Résultat Intelligent

✅ **Bon Code (Repository cohésif)**
```text
Status: ✅ SUCCESS
📊 Métriques:
• Cohésion: 100%
• Lignes: 180
• Méthodes: 25
✅ Aucune violation - Respect des principes SOLID!
```

❌ **Violation SRP (Service dispersé)**
```text
Status: ❌ ERROR
📊 Métriques:
• Cohésion: 45%
• Responsabilités: 4 (CRUD, VALIDATION, NOTIFICATION, CALCUL)
⚠️ Violation : Multiples responsabilités détectées.
💡 Suggestion: Séparer en plusieurs classes par domaine.
```

## Licence
MIT

## Auteur
Asaph N'dja
