# 🛡️ Guide d'Intégration du Gardien Intelligent

SOLID-Check protège votre base de code contre la pourriture logicielle en utilisant une analyse intelligente (Cohésion + Contexte).

## 1. Le Gardien Local (Pre-commit Hook)

Bloquez les commits qui violent réellement le principe de responsabilité unique (SRP). L'analyse intelligente évite de bloquer les fichiers longs s'ils sont bien organisés.

### Installation (Husky)

1.  Installez Husky :
    ```bash
    npm install husky --save-dev
    ```

2.  Ajoutez le hook de pre-commit :
    ```bash
    npx husky add .husky/pre-commit "npx solid-check"
    ```

### Pourquoi c'est mieux ?
Contrairement à l'ancien système, le Gardien Intelligent ne vous embêtera pas pour un Repository de 120 lignes s'il est 100% cohésif. Il ne bloquera que si vous mélangez, par exemple, de la logique de calcul avec de l'envoi d'emails dans le même fichier.

---

## 2. Le Gardien du Cloud (CI/CD)

### GitHub Actions
Utilisez le workflow fourni pour valider chaque Pull Request.

**Configuration recommandée :**
```yaml
- name: Analyse SOLID
  run: npx solid-check --config config/solid-config-intelligente.json
```

### Avantages de l'Analyse Intelligente en CI :
- **Moins de faux positifs** : Moins de builds cassés pour des raisons de "taille de fichier" injustifiées.
- **Vraie qualité logicielle** : Seules les vraies dettes techniques (manque de cohésion) stoppent le déploiement.

---

## 🎛️ Configuration du Gardien

Utilisez `config/solid-config-intelligente.json` pour définir vos seuils de cohésion (LCOM) et le nombre maximum de responsabilités autorisées par classe.
