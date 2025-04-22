# SOSStock / StockTrauma

## Application de Gestion de Stock pour SOS Trauma

SOSStock est une application web moderne de gestion de stock conçue pour SOS Trauma, permettant de centraliser la gestion des stocks pour plusieurs lieux de stockage, anticiper les ruptures en se basant sur l'historique des mouvements, simplifier les commandes et transferts de produits, et fournir des rapports détaillés.

## Table des matières

- [Fonctionnalités](#fonctionnalités)
- [Technologies utilisées](#technologies-utilisées)
- [Installation](#installation)
- [Configuration](#configuration)
- [Démarrage](#démarrage)
- [Structure du projet](#structure-du-projet)
- [Base de données](#base-de-données)
- [Déploiement](#déploiement)
- [Licence](#licence)

## Fonctionnalités

- **Gestion des produits** : Ajouter, modifier, supprimer des articles et gérer les variantes
- **Mouvements de stock** : Entrées, sorties, transferts entre sites avec traçabilité complète
- **Alertes et notifications** : Seuils critiques, DLUO proches, suggestions de réapprovisionnement
- **Commandes fournisseurs** : Création manuelle ou automatique, suivi des livraisons
- **Rapports et statistiques** : Analyses détaillées par lieu, catégorie, fournisseur
- **Gestion utilisateurs** : Rôles Admin et Opérateur avec permissions différentes

## Technologies utilisées

- **Frontend** :
  - React avec TypeScript
  - TailwindCSS
  - React Query/SWR pour la gestion des requêtes

- **Backend** :
  - Supabase (PostgreSQL, Auth, API, Serverless Functions)

- **Outils de développement** :
  - Vite
  - Jest
  - Docker

## Installation

### Prérequis

- Node.js (v16 ou supérieur)
- npm (v7 ou supérieur)
- Compte Supabase

### Étapes d'installation

1. Clonez le dépôt :
   ```bash
   git clone https://github.com/votre-organisation/sosstock.git
   cd sosstock
   ```

2. Installez les dépendances :
   ```bash
   npm install
   ```

3. Créez un fichier `.env.local` à la racine du projet avec les informations suivantes :
   ```
   VITE_SUPABASE_URL=votre_url_supabase
   VITE_SUPABASE_ANON_KEY=votre_clé_anon_supabase
   ```

## Configuration

### Configuration de Supabase

1. Créez un nouveau projet sur [Supabase](https://app.supabase.io)
2. Allez dans l'onglet SQL Editor et exécutez les scripts SQL fournis dans le dossier `/database` pour créer les tables nécessaires
3. Configurez l'authentification dans les paramètres du projet Supabase

### Configuration des rôles utilisateurs

1. Après avoir configuré votre base de données, créez un premier utilisateur Admin via l'interface de Supabase ou via l'API
2. Ajoutez manuellement un enregistrement dans la table `profiles` avec le rôle `admin`

## Démarrage

### Mode développement

Pour lancer l'application en mode développement :

```bash
npm run dev
```

L'application sera accessible sur http://localhost:5173

### Mode production

Pour construire l'application pour la production :

```bash
npm run build
```

Pour prévisualiser la version de production :

```bash
npm run preview
```

## Structure du projet

```
sosstock/
├── .github/                    # Configuration CI/CD
├── public/                     # Assets publics
├── src/
│   ├── assets/                 # Images, SVG, etc.
│   ├── components/             # Composants React réutilisables
│   │   ├── common/             # Composants génériques
│   │   ├── layout/             # Composants de mise en page
│   │   └── ...                 # Composants spécifiques aux fonctionnalités
│   ├── context/                # Contextes React
│   ├── hooks/                  # Custom hooks
│   ├── lib/                    # Utilitaires et clients API
│   ├── pages/                  # Pages de l'application
│   ├── routes/                 # Configuration des routes
│   ├── services/               # Services métier
│   ├── types/                  # Définitions TypeScript
│   ├── App.tsx                 # Composant racine
│   └── index.tsx               # Point d'entrée
└── ...                         # Fichiers de configuration
```

## Base de données

Le schéma de la base de données se compose des tables principales suivantes :

- `profiles` - Informations utilisateurs
- `products` - Produits de l'inventaire
- `product_variants` - Variantes de produits
- `categories` - Catégories de produits
- `locations` - Lieux de stockage
- `inventory` - Stock par produit et lieu
- `batches` - Lots avec dates de péremption
- `inventory_movements` - Historique des mouvements
- `suppliers` - Fournisseurs
- `orders` - Commandes
- `order_items` - Éléments des commandes
- `alerts` - Alertes et notifications

Consultez le fichier `/database/schema.sql` pour le schéma complet.

## Déploiement

### Déploiement avec Vercel

1. Connectez votre dépôt GitHub à Vercel
2. Configurez les variables d'environnement :
   - `VITE_SUPABASE_URL` : URL de votre projet Supabase
   - `VITE_SUPABASE_ANON_KEY` : Clé anonyme de votre projet Supabase
3. Déployez l'application en suivant les instructions de Vercel

### Déploiement avec Netlify

1. Connectez votre dépôt GitHub à Netlify
2. Configurez les variables d'environnement
3. Définissez la commande de build : `npm run build`
4. Définissez le répertoire de publication : `dist`

### Déploiement Docker (option avancée)

Un fichier Docker et docker-compose sont fournis pour faciliter le déploiement :

```bash
# Construire l'image
docker-compose build

# Démarrer l'application
docker-compose up -d
```

## Guide de développement

### Ajout de nouvelles fonctionnalités

1. Créez une nouvelle branche à partir de `main` :
   ```bash
   git checkout -b feature/nom-de-la-fonctionnalite
   ```

2. Implémentez votre fonctionnalité et testez-la

3. Créez une Pull Request vers `main`

### Tests

Pour lancer les tests unitaires :

```bash
npm run test
```

Pour lancer les tests e2e :

```bash
npm run test:e2e
```

### Conventions de code

- Suivez les conventions ESLint configurées dans le projet
- Utilisez les composants TailwindCSS pour le style
- Respectez la structure des dossiers existante

## Intégrations possibles

SOSStock peut être intégré avec :

- Des lecteurs de codes-barres pour une saisie rapide
- Des systèmes d'étiquetage
- Des API de fournisseurs pour la commande automatique
- Des outils de comptabilité pour la gestion des coûts

## Maintenance et support

Pour signaler un bug ou demander une fonctionnalité :

1. Ouvrez une issue sur GitHub
2. Décrivez le problème ou la fonctionnalité en détail
3. Si possible, incluez des captures d'écran ou des étapes pour reproduire le problème

## Feuille de route

Fonctionnalités prévues pour les prochaines versions :

- Intégration de QR codes pour la gestion des mouvements
- Application mobile pour la saisie sur le terrain
- Module de prévision avancée avec machine learning
- Intégration avec des systèmes ERP
- Gestion de projets avec consommation prévisionnelle

## Crédits

SOSStock a été développé pour SOS Trauma par [Votre Équipe].

## Licence

Ce projet est sous licence [MIT](LICENSE.md).

---

Pour toute question, contactez l'équipe de développement à l'adresse support@sosstock.com
