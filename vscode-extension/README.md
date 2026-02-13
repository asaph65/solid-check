# SOLID-Check Assistant Intelligent

L'assistant VS Code officiel pour la librairie **SOLID-Check**. Passez d'une analyse rigide à une analyse intelligente basée sur la cohésion et le contexte.

## ✨ Fonctionnalités Intelligentes

- **Analyse en Temps Réel** : Vos violations SOLID apparaissent instantanément dès la saisie.
- **Cohésion > Taille** : Fini les faux positifs sur vos gros repositories ! L'extension utilise l'algorithme **LCOM** pour valider la structure réelle du code.
- **Détection de Contexte** : L'extension comprend si vous éditez un *Service*, un *Repository* ou un *Controller* et adapte ses règles.
- **Analyse des Responsabilités** : Identifie les mélanges de domaines (CRUD, Validation, Calcul, Notification).
- **Refactorisation IA (Quick Fix)** : Cliquez sur l'ampoule pour que l'IA refactorise automatiquement votre code selon les principes SOLID.

## 📊 Feedback Visuel

- 🟠 **Soulignement Orange** : Fichier long avec une cohésion moyenne.
- 🔴 **Soulignement Rouge** : Violation flagrante du SRP (Multiples responsabilités ou cohésion très faible).

## 🚀 Installation

Cette extension nécessite que `solid-check` soit installé dans votre projet ou globalement.
