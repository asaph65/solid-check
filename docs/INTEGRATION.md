# 🛡️ Guide d'Intégration du Gardien

Pour garantir que votre base de code reste propre **pour toujours**, SOLID-Check offre deux niveaux de protection.

## 1. Le Gardien Local (Pre-commit Hook)

Empêchez-vous (et votre équipe) de commiter du code sale. Le scan se lance automatiquement avant chaque `git commit`.

### Installation

Nous utilisons **Husky** pour gérer les hooks Git.

1.  Installez Husky en dépendance de développement :
    ```bash
    npm install husky --save-dev
    ```

2.  Activez les hooks Git :
    ```bash
    npx husky install
    ```

3.  Ajoutez le hook de pre-commit :
    ```bash
    npx husky add .husky/pre-commit "npm run valider"
    ```

### Résultat
Désormais, si vous tentez de commiter un fichier qui ne respecte pas les règles (ex: fonction > 20 lignes), le commit sera **refusé** instantanément.

---

## 2. Le Gardien du Cloud (CI/CD)

Assurez-vous qu'aucune Pull Request ne puisse être mergée si elle contient des violations.

### GitHub Actions
Le fichier de configuration est déjà inclus dans votre projet : `.github/workflows/solid-check.yml`.

**Ce qu'il fait :**
1.  Il s'active à chaque `push` ou `pull request` sur `main`.
2.  Il installe le projet.
3.  Il lance `npm run valider`.
4.  ⛔ **Il bloque le merge** si le score n'est pas suffisant ou s'il y a des violations bloquantes.

### GitLab CI
Si vous utilisez GitLab, ajoutez ceci à votre `.gitlab-ci.yml` :

```yaml
stages:
  - qualite

audit_solid:
  stage: qualite
  image: node:18
  script:
    - npm ci
    - npm run valider
  allow_failure: false
```

---

## 🎛️ Configuration du Gardien

Vous pouvez assouplir ou durcir le Gardien dans `config/regles.json` :

```json
{
  "regles": {
    "echecSurViolation": true  // Mettre à false pour ne pas bloquer le build (déconseillé)
  }
}
```
