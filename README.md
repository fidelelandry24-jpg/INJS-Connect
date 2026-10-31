# INJS Connect

Application web responsive en React + Vite, pensée pour la communauté de l’INJS : étudiants, enseignants et administration.

## Fonctionnalités du prototype

- Tableau de bord des annonces et actualités.
- Parcours organisé en 7 rubriques.
- Ressources rapides avec copie de textes et création de modèles.
- Assistant de rédaction utilisant actuellement un modèle local de démonstration.
- Espace vidéos et médias préparé pour une future médiathèque.
- Formulaire de publication d’annonces et base de données Supabase optionnelle.
- Interface responsive pour téléphone, tablette et ordinateur.

## Lancer le projet en local

Prérequis : Node.js 20 ou version récente et npm.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Ouvrez l’adresse locale indiquée par Vite. Sous Windows, vous pouvez copier `.env.example` vers `.env.local` manuellement.

## Configurer Supabase (facultatif pour la démonstration)

1. Créez un projet Supabase.
2. Copiez l’URL du projet et la clé **publique / publishable** dans `.env.local`.
3. Exécutez `supabase/schema.sql` dans l’éditeur SQL du bon projet.
4. Relancez le serveur Vite après modification du fichier `.env.local`.

N’insérez jamais une clé `service_role`, une clé secrète ou une clé d’API IA dans le code du navigateur. Le schéma bloque volontairement la publication par des utilisateurs ordinaires tant que les rôles d’administration ne sont pas configurés.

## État et limites

Cette livraison est un **prototype fonctionnel d’interface**, pas encore un service prêt pour une mise en production. L’authentification, les permissions par rôle, la vraie génération IA via un serveur sécurisé, les notifications, les emplois du temps connectés et l’hébergement des vidéos restent à mettre en place. Les ressources créées dans l’interface sont provisoires tant que leur sauvegarde n’est pas raccordée à la base.

Pour une médiathèque importante, les vidéos devront être hébergées sur un service de stockage/streaming adapté : aucun hébergement n’est réellement illimité et les quotas/coûts dépendront du fournisseur.

## Structure

```text
injs-connect/
├── index.html
├── package.json
├── .env.example
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── styles.css
│   └── lib/supabase.js
└── supabase/schema.sql
```

## Déploiement

Le projet peut être déployé sur un hébergeur compatible avec les sites Vite (par exemple Cloudflare Pages, Netlify ou Vercel). Configurez les variables `VITE_SUPABASE_URL` et `VITE_SUPABASE_PUBLISHABLE_KEY` dans les paramètres de l’hébergeur si Supabase est utilisé.
