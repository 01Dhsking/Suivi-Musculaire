# Forma — Suivi musculaire

Application personnelle en français : poids, mensurations, estimations de masse grasse et musculaire, courbes, phases, objectifs personnalisés et motivation. Interface adaptée au PC, à la tablette et au téléphone.

![Tableau de bord sans données fictives](docs/apercu.png)

L'interface utilise un thème anthracite et orange, un texte courant de 18 px, de grands indicateurs et un bandeau sportif « Mode focus ». Les tableaux, graphiques et formulaires utilisent la même palette contrastée sur ordinateur, tablette et téléphone.

## Architecture

```text
Navigateur (PC / tablette / téléphone)
             │ HTTP, même origine
             ▼
web : Next.js + React + TypeScript, port 3000
             │ routes serveur /api/*, requêtes SQL paramétrées
             ▼
db : PostgreSQL 17, réseau interne Docker
             │
             ▼
volume persistant postgres_data
```

Le navigateur ne se connecte jamais directement à PostgreSQL. La base n'a aucun port publié sur la machine hôte. Le frontend et les routes serveur sont embarqués dans le même conteneur `web`. Aucun compte externe ni service cloud n'est nécessaire.

## Déploiement dans Dokploy

Le fichier principal `docker-compose.yml` est prévu pour Dokploy en mode **Docker Compose standard**. Il reprend la structure du projet voisin `go-go-poke` : construction de la cible `runner`, application reliée à Traefik via `dokploy-network`, PostgreSQL uniquement sur le réseau interne `app-data`, volume persistant et contrôles de santé. Les services gardent leurs noms `web` et `db` et le volume `postgres_data`.

1. Dans Dokploy, créer un service **Compose**, de type **Docker Compose**, puis connecter le dépôt Git et la branche souhaitée.
2. Utiliser le chemin Compose `./docker-compose.yml`, avec le contexte de construction à la racine du dépôt.
3. Dans **Environment**, définir deux secrets personnels différents :

   ```dotenv
   POSTGRES_PASSWORD=un-secret-fort-pour-postgres
   APP_PASSWORD=un-autre-secret-fort-pour-forma
   ```

   Le Compose transmet explicitement ces variables aux conteneurs. `PGHOST=db`, `PGUSER=suivi` et `PGDATABASE=suivi_musculaire` sont déjà configurés ; aucune URL de base ni variable `NEXT_PUBLIC_*` n'est nécessaire. Les mots de passe ne sont pas incorporés à l'image. Les caractères spéciaux n'ont pas besoin d'encodage URL ; respecter les règles du fichier `.env` et utiliser des guillemets simples autour d'un secret contenant `$` ou `#`.
4. Faire pointer le DNS du domaine vers le serveur, puis ajouter le domaine dans **Domains** :

   | Champ | Valeur |
   | --- | --- |
   | Service | `web` |
   | Container Port | `3000` |
   | Path | `/` |
   | Internal Path | vide |
   | Strip Path | désactivé |
   | HTTPS | activé, certificat Let's Encrypt |

5. Vérifier **Preview Compose**, puis déployer. Le domaine doit cibler `web`, jamais `db`. Dokploy ajoute les labels de routage du domaine ; aucune règle de domaine n'est codée en dur dans le dépôt. Après ajout ou changement d'un domaine, redéployer le service Compose.
6. Se connecter sur le domaine HTTPS avec l'identifiant **admin** et le secret `APP_PASSWORD`.

Le port 3000 est exposé uniquement dans le réseau Docker : il n'y a aucun port hôte à ouvrir ou réserver pour l'application. Traefik assure l'accès HTTPS. PostgreSQL n'est pas relié au réseau partagé `dokploy-network`. Ce réseau externe doit exister sur l'hôte Dokploy ; il est normalement fourni par l'installation Dokploy. Le mode **Isolated Deployments** n'est pas la configuration retenue ici, puisque le réseau Traefik est explicitement fixé à `dokploy-network`.

La vérification de santé de `web` appelle `/api/health` avec l'authentification de l'application et vérifie aussi PostgreSQL. Un appel à `/` sans identifiants renvoie normalement 401 et ne convient donc pas à ce contrôle. Aucun volume de fichiers ni SQLite n'est nécessaire : les données de Forma sont toutes dans PostgreSQL.

La base et le schéma sont initialisés automatiquement. Lors des redéploiements, conserver le même projet Compose et son volume `postgres_data`. Un nouveau projet Dokploy crée un autre volume : pour y retrouver les mesures locales, importer une sauvegarde JSON. Pour sauvegarder la base du déploiement, adapter les commandes de la section sauvegarde en retirant `-f docker-compose.local.yml`.

Références : [domaines Compose Dokploy](https://docs.dokploy.com/docs/core/docker-compose/domains), [variables d'environnement Compose](https://docs.dokploy.com/docs/core/docker-compose).

## Démarrage local avec Docker

Prérequis : Docker Desktop démarré avec les conteneurs Linux et Docker Compose.

Utiliser explicitement `docker-compose.local.yml` pour le PC et le réseau local. Ce fichier publie le port choisi et ne dépend pas du réseau Traefik de Dokploy. Les deux fichiers sont autonomes : ne pas les combiner avec plusieurs options `-f`.

Sur cette machine, la vérification initiale a signalé que la virtualisation nécessaire à WSL2 n'était pas activée. Si Docker ne démarre pas, activer la virtualisation dans l'UEFI/BIOS et le composant Windows « Plateforme d'ordinateur virtuel », puis redémarrer Windows. Cette configuration système n'est pas modifiée par le projet.

Un `.env` local a été généré lors de la création du projet, avec deux secrets aléatoires. Il est exclu de Git et de l'image Docker. Sur une nouvelle installation :

```powershell
Copy-Item .env.example .env
```

Remplacer `POSTGRES_PASSWORD` et `APP_PASSWORD` par des secrets personnels dans `.env`, puis :

```powershell
docker compose -f docker-compose.local.yml up -d --build
```

Ouvrir [http://localhost:3000](http://localhost:3000). Le navigateur demande l'identifiant **admin** et le mot de passe **APP_PASSWORD** défini dans `.env`.

Le schéma est créé automatiquement lors du premier accès ou du contrôle de santé. Le démarrage du serveur attend que PostgreSQL soit prêt. L'application fonctionne sans données fictives : ajouter une mesure puis configurer le prénom, les objectifs et la raison de départ dans « Objectifs & données ».

Commandes utiles :

```powershell
docker compose -f docker-compose.local.yml ps
docker compose -f docker-compose.local.yml logs -f web
docker compose -f docker-compose.local.yml down
```

`docker compose -f docker-compose.local.yml down` conserve les données. Ne pas ajouter `-v` : cela supprimerait le volume PostgreSQL. Un volume persistant ne remplace pas une sauvegarde.

## Accès tablette et téléphone

1. Connecter les appareils au même réseau local que le serveur.
2. Dans `.env`, remplacer `APP_BIND=127.0.0.1` par `APP_BIND=0.0.0.0`.
3. Exécuter `docker compose -f docker-compose.local.yml up -d` pour appliquer le changement.
4. Trouver l'adresse IPv4 locale du PC avec `ipconfig`.
5. Ouvrir `http://ADRESSE-IP-DU-PC:3000` depuis les autres appareils et utiliser les mêmes identifiants.

Si nécessaire, autoriser le port TCP 3000 dans le pare-feu Windows pour le réseau privé seulement. Le PC et Docker doivent rester allumés. Tous les appareils partagent les mêmes données PostgreSQL.

L'application est conçue pour une personne sur un réseau de confiance. L'authentification HTTP Basic exige HTTPS pour protéger les identifiants en transit sur un réseau non fiable. Pour un accès Internet, placer le serveur derrière un reverse proxy HTTPS ; ne pas ouvrir directement ce port sur le routeur. Il n'y a pas de comptes multiples.

## Données et graphiques

- Poids en kg obligatoire ; tours de taille, poitrine, hanches, bras, cuisse et mollet en cm, graisse en pourcentage et masse musculaire en kg facultatifs.
- Les nouvelles mensurations ont leurs dernières valeurs sur le tableau de bord, leurs colonnes dans le journal et leurs courbes via le sélecteur « Indicateur ». Les champs sont modifiables et peuvent être laissés vides. Toujours mesurer le même côté dans les mêmes conditions.
- La graisse et le muscle sont des estimations saisies avec une provenance, jamais déduites du poids.
- Chaque saisie conserve un instant avec fuseau. L'interface affiche les heures du navigateur.
- Périodes glissantes : 7, 30, 90 jours ou tout l'historique jusqu'à maintenant.
- Granularités : minute, heure, jour. Chaque point correspond à la dernière mesure réellement saisie dans l'intervalle, dans le fuseau de l'appareil. Les intervalles vides ne créent pas de mesures. Les lignes relient seulement les points disponibles.
- Les cartes affichent la dernière valeur connue de chaque indicateur et sa date ; un champ facultatif absent n'efface pas l'historique.
- Les objectifs expriment la progression entre le premier relevé et la cible, limitée entre 0 et 100 %, pour la perte comme pour le gain.
- Les phases contiennent une direction, des dates, un objectif et un bilan. Plusieurs phases peuvent se chevaucher ; le tableau de bord montre la première phase active dans l'ordre des dates.

## Petits objectifs personnalisés

Dans « Ma motivation », la section « Mes petits objectifs » permet de créer, modifier et supprimer un objectif personnel : nom, description, cible chiffrée, unité libre (séances, jours, km, répétitions…), progression actuelle et échéance facultative. La progression est saisie manuellement, indépendamment des mesures corporelles. Un objectif à cocher utilise une cible de 1. Le bouton avec une coche le marque comme accompli en portant la progression à la cible ; la modification permet de le rouvrir ou corriger sa progression. La barre reste limitée à 100 % même si la progression dépasse la cible.

Les données sont conservées dans PostgreSQL et partagées entre appareils. Le schéma existant est mis à niveau au redémarrage du serveur sans effacer l'historique : ajout de cinq colonnes facultatives et de la table `goals`.

## Sauvegarde et restauration

Dans « Objectifs & données », exporter une sauvegarde JSON version 2 contenant le profil, les objectifs corporels, les petits objectifs personnalisés, toutes les mensurations et les phases. L'import est validé avant écriture, puis appliqué dans une transaction : il fusionne par UUID, met à jour les entrées de même identifiant et le profil, et conserve les autres entrées. Les sauvegardes version 1 restent acceptées : les nouvelles mensurations absentes sont restaurées comme non renseignées et les petits objectifs existants restent conservés. Limite : 10 Mo, 50 000 mesures, 1 000 phases et 1 000 petits objectifs. Une sauvegarde contient des données personnelles : la conserver dans un emplacement privé.

Pour une sauvegarde PostgreSQL complète, sans risque d'encodage de redirection binaire PowerShell :

```powershell
New-Item -ItemType Directory -Force backups
docker compose -f docker-compose.local.yml exec -T db pg_dump -U suivi -d suivi_musculaire -Fc -f /tmp/suivi.dump
docker compose -f docker-compose.local.yml cp db:/tmp/suivi.dump ./backups/suivi.dump
```

Le mot de passe PostgreSQL ne se change pas simplement en modifiant `.env` après création du volume : il faut également changer le mot de passe du rôle dans la base existante.

## Développement local

Prérequis : Node.js 24 et une base PostgreSQL accessible. Créer `.env.local` avec :

```dotenv
DATABASE_URL=postgresql://utilisateur:mot-de-passe@localhost:5432/suivi_musculaire
APP_PASSWORD=un-mot-de-passe-personnel
```

```powershell
npm ci
npm run dev
```

Les caractères spéciaux du mot de passe doivent être encodés dans `DATABASE_URL`. En Docker, la connexion utilise des variables PG séparées et n'a pas ce besoin. `APP_PASSWORD` est obligatoire dans Compose ; hors Compose, le définir également pour protéger l'accès. Le rôle PostgreSQL doit pouvoir créer les tables au premier lancement.

## Vérifications

Validation réalisée le 24 octobre 2026 : compilation de production et TypeScript réussis, 8 tests unitaires et 3 tests de bout en bout réussis contre PostgreSQL 17 sous Windows. Le parcours navigateur vérifie ajout, modification, persistance après rechargement, graphiques et suppression des mesures, les cinq nouvelles mensurations, les petits objectifs (création, progression, accomplissement, suppression), l'export et la restauration JSON depuis le mobile. Les anciennes sauvegardes sont acceptées et une mise à niveau réelle de l'ancien schéma PostgreSQL a conservé les données existantes. Captures en 1440, 768 et 390 pixels ; absence de débordement de page vérifiée sur mobile. L'accès API sans authentification renvoie 401 et les données de test ont été retirées.

Les deux configurations passent `docker compose config` : fichier principal Dokploy et fichier local. Les réseaux, l'absence de ports hôtes en production, la cible `runner`, le volume persistant, le JavaScript du contrôle de santé et le refus des secrets manquants ont été vérifiés. La construction de l'image et le lancement des conteneurs n'ont pas pu être vérifiés sur cette machine à cause de la virtualisation WSL2 désactivée. Aucun déploiement sur un serveur Dokploy n'a été effectué. La base Windows utilisée pour les tests applicatifs est temporaire et n'est pas la base Docker du projet.

```powershell
npm run typecheck
npm test
npm run build
```

Tests de bout en bout, contre une instance de test démarrée et joignable :

```powershell
npx playwright install chromium
npm run test:e2e
```

Les tests utilisent `http://127.0.0.1:3000` par défaut et le mot de passe du `.env`. `TEST_BASE_URL` et `APP_PASSWORD` peuvent être définis pour une autre instance. Ils créent et suppriment leurs propres mesures et phases ; le test API restaure le profil initial. Les lancer sur une base de test, sans édition simultanée du profil. Les captures PC, tablette et mobile sont enregistrées dans `test-results/`.

## Routes serveur

| Route | Méthodes | Usage |
| --- | --- | --- |
| `/api/tracker` | GET | Profil, mesures triées, phases ; lecture cohérente |
| `/api/measurements` | POST, PUT, DELETE | Créer, corriger, supprimer une mesure |
| `/api/profile` | PUT | Prénom, motivation, objectifs |
| `/api/phases` | POST, PUT, DELETE | Créer, modifier, supprimer une phase |
| `/api/goals` | POST, PUT, DELETE | Créer, modifier la progression et supprimer un petit objectif |
| `/api/backup` | POST | Importer une sauvegarde JSON |
| `/api/health` | GET | Santé du serveur et de PostgreSQL |

Toutes ces routes sont protégées par le mot de passe s'il est configuré. Les écritures exigent aussi un en-tête `Origin` identique à l'hôte de la requête ; l'interface web l'envoie automatiquement. Les entrées sont validées côté serveur avec Zod. Les secrets de connexion restent côté serveur.
