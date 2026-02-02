# SOLID-Check

> Librairie d'analyse de code JavaScript respectant les principes SOLID

## 📋 Description

**SOLID-Check** est une librairie d'analyse statique de code JavaScript conçue selon une architecture micro-services. Elle vérifie que votre code respecte les bonnes pratiques en termes de taille de fichiers et de complexité.

### Principes Architecturaux

Cette librairie est construite en respectant strictement les **principes SOLID** :

- **S** - Single Responsibility : Chaque service a une seule responsabilité
- **O** - Open/Closed : Extension via configuration, pas modification
- **L** - Liskov Substitution : Les implémentations sont interchangeables
- **I** - Interface Segregation : Interfaces spécifiques et minimales
- **D** - Dependency Inversion : Injection de dépendances systématique

##  Fonctionnalités

###  Analyseur de Taille
Vérifie que les fichiers ne dépassent pas **100 lignes** (configurable).

###  Détecteur de Complexité
Analyse la complexité du code en évaluant :
- Le nombre de méthodes par classe
- La fréquence des mots-clés de contrôle (if, for, while, etc.)
- Le nombre de paramètres par fonction

###  Analyseur de Cohésion (SRP)
Détecte les violations du principe de responsabilité unique avec 4 algorithmes sophistiqués :

#### 1. Ratio "ET"
Détecte les conjonctions dans les noms de fonctions :
- `sauvegarderEtEnvoyerEmail` Violation !
- `creerUtilisateur` OK

#### 2. Diversité des Verbes
Analyse si le fichier mélange trop de domaines métier :
- Calcul + Communication + Validation = Manque de cohésion
- Uniquement Calcul = Cohésif

#### 3. Lignes par Fonction
Signale les fonctions dépassant **20 lignes** (trop de responsabilités).

#### 4. Dépendances Internes
Détecte les propriétés de classe jamais utilisées ensemble (manque de cohésion).

**Résultat** : Score de cohésion de 0 à 100, avec détail des violations.

###  Moteur de Validation
Orchestrateur qui :
- Coordonne tous les analyseurs
- Génère un rapport détaillé
- Retourne un code de sortie 1 en cas d'échec

## 📦 Installation

```bash
# Cloner le projet
git clone <url-du-repo>
cd solid-check

# Installer les dépendances
npm install
```

## 🔧 Utilisation

### Validation de votre projet

```bash
npm run valider
```

### Test de l'analyseur de cohésion

```bash
npm run test:cohesion
```

### Exemple d'utilisation programmatique

```bash
npm run exemple
```

## ⚙️ Configuration

La configuration se trouve dans `config/regles.json` :

```json
{
  "limites": {
    "lignesParFichier": 100,
    "methodesParClasse": 10,
    "parametresParFonction": 5
  },
  "complexite": {
    "motsClésMaximum": 15,
    "niveauxImbrication": 4
  },
  "chemins": {
    "aAnalyser": ["src/**/*.js"],
    "aIgnorer": ["node_modules/**", "test/**"]
  }
}
```

### Injection de Dépendances

Exemple du Service de Lecture de Fichiers :

```javascript
// Interface
class ILecteurFichiers {
  async lireFichier(cheminFichier) { ... }
}

// Implémentation concrète
class LecteurSystemeFichiers extends ILecteurFichiers {
  async lireFichier(cheminFichier) {
    return await fs.readFile(cheminFichier, 'utf-8');
  }
}

// Service avec injection de dépendances
class ServiceLecteurFichiers {
  constructor(adaptateur) {  // ← Injection
    this._adaptateur = adaptateur;
  }
}

// Utilisation
const adaptateur = new LecteurSystemeFichiers();
const service = new ServiceLecteurFichiers(adaptateur);
```

## Exemple de Rapport

```
================================================================================
📊 RAPPORT DE VALIDATION SOLID-Check
================================================================================

📄 src/exemple-fichier.js (150 lignes)
--------------------------------------------------------------------------------
❌ Le fichier 'src/exemple-fichier.js' contient 150 lignes (limite: 100)
   Détails: { "nombreLignes": 150, "limite": 100, "depassement": 50 }

⚠️  Complexité élevée détectée: 18 mots-clés de contrôle (limite: 15)

================================================================================

❌ Validation échouée - 2 violation(s) détectée(s)
📈 5 fichier(s) analysé(s)
⚠️  2 violation(s) détectée(s)

================================================================================
```

## Tests

Pour tester la librairie sur elle-même :

```bash
npm run valider
```

## Licence

MIT

## Auteur

Asaph N'dja

## 🤖 Ressources IA

Le projet inclut des prompts optimisés pour l'assistance au refactoring :
- [Prompt Assistant Refactoring](docs/IA_REFACTORING_PROMPT.md)

## 🛡️ Intégration & Sécurité

Protégez votre projet contre la dette technique :
- **Pre-commit** : Bloquez les commits sales localement.
- **CI/CD** : Bloquez les merges non conformes sur GitHub/GitLab.

👉 [Voir le Guide d'Intégration du Gardien](docs/INTEGRATION.md)
