# Suivi musculaire — cadrage initial

Date : 24 octobre 2026.

## Demande conservée

Créer un petit projet personnel dans ce dossier pour suivre la perte de graisse et l'augmentation des muscles. La plateforme doit aussi soutenir la motivation : rappeler pourquoi l'utilisateur a commencé, rendre les progrès visibles avec des chiffres et encourager la régularité, même pour de petits progrès.

Prévoir des graphiques d'évolution inspirés de l'expérience TradingView, avec sélection de temporalités. L'utilisateur a cité le jour, l'heure et la minute. Conserver la date et l'heure des saisies ; ne pas fabriquer de mesures entre deux saisies.

L'utilisateur évoque également un tableau des phases, dont le sens exact reste à confirmer. Certains passages de la transcription vocale, dont « hypoglycite » et « boucher cette colonne-là avec un plan », sont ambigus et ne constituent pas des exigences interprétées.

Le cadrage a été présenté puis validé par l'utilisateur. Le développement est autorisé. L'utilisateur demande explicitement un Dockerfile, Docker Compose, PostgreSQL dans un conteneur séparé, des routes côté serveur et une interface web pour PC, tablette et téléphone.

## Proposition technique à discuter

- Espace : dossier courant C:/Users/HP/Desktop/Code/Suivi-Musculaire, actuellement vide hormis Git.
- Produit : application web en français, adaptée à l'ordinateur, à la tablette et au téléphone.
- Langage : TypeScript.
- Framework : Next.js avec React.
- Interface : Tailwind CSS.
- Graphiques : Recharts, avec infobulles, périodes et comparaison aux objectifs.
- Stockage retenu après validation : PostgreSQL 17 dans un conteneur Docker distinct ; export et import JSON pour sauvegarde.
- Accès partagé entre appareils au même serveur web ; mot de passe personnel par authentification HTTP Basic. Aucun service cloud nécessaire.

## Périmètre initial proposé

1. Tableau de bord : dernières mesures, variations depuis le départ, progression vers les objectifs.
2. Journal : poids, tour de taille, autres mensurations et, si disponibles, estimations de masse grasse et musculaire, avec date, heure et provenance.
3. Graphiques : évolution du poids, des mensurations et des estimations disponibles ; périodes 7 jours, 30 jours, 90 jours, tout l'historique. Les granularités minute/heure/jour restent distinctes des périodes et ne montrent que les données réellement disponibles.
4. Phases : proposition de périodes datées avec objectif et bilan ; interprétation à confirmer.
5. Motivation : raison de départ, petits objectifs, jalons et notes personnelles.
6. Sauvegarde : export et import des données personnelles.

## Principes

- Différencier mesures saisies, estimations et objectifs.
- Ne pas déduire la perte de graisse ou le gain de muscle du poids seul.
- Prévoir des états vides clairs ; aucune donnée d'exemple présentée comme une mesure réelle.
- Distinguer la vue minute/heure utile pour les événements ou les séances de l'évolution corporelle entre les mesures disponibles.

## Étapes proposées

1. Cadrage validé ; interprétation retenue des phases : périodes de perte de graisse, maintien ou prise de muscle, avec objectif et bilan.
2. Construire l'interface et le journal de mesures.
3. Ajouter PostgreSQL, routes serveur, graphiques, objectifs, motivation et sauvegardes.
4. Fournir Dockerfile et Compose avec volume persistant et contrôles de santé.
5. Vérifier les calculs, la sauvegarde et l'affichage sur plusieurs tailles d'écran.

## Compléments demandés après la première version

L'utilisateur a demandé de laisser Docker de côté et de terminer les autres mensurations et les petits objectifs personnalisés.

- Mensurations ajoutées : tour de poitrine, de hanches, de bras, de cuisse et de mollet, en centimètres. Champs facultatifs disponibles en saisie, modification, journal, graphiques et sauvegardes. Des cartes affichent les dernières valeurs connues.
- Petits objectifs : création libre dans « Ma motivation », nom, description, cible chiffrée, unité, progression actuelle et échéance facultative. Modification, accomplissement et suppression disponibles ; les objectifs sont conservés dans PostgreSQL et inclus dans les sauvegardes.
- Les petits objectifs sont suivis manuellement et indépendamment des objectifs corporels du profil. Un objectif simple à cocher utilise une cible de 1.
- Mise à niveau additive de la base existante ; anciennes sauvegardes JSON version 1 acceptées. Nouvel export en version 2 avec les petits objectifs et les nouvelles mensurations.
- Docker reste en attente à la demande de l'utilisateur.

### État des deux compléments

- [x] Autres mensurations : saisie, modification, affichage, graphiques et persistance.
- [x] Petits objectifs personnalisés : création, modification, progression, accomplissement et suppression.
- [x] Sauvegarde et restauration des deux compléments, compatibilité avec la version 1.
- [x] Vérifications : 8 tests unitaires, 3 tests de bout en bout, compilation de production et TypeScript ; migration de l'ancien schéma PostgreSQL vérifiée avec conservation d'une mesure existante.

## Préparation Dokploy

À la demande suivante de l'utilisateur, la configuration du projet voisin `go-go-poke` a été examinée pour préparer le déploiement Dokploy.

- `docker-compose.yml` cible désormais Dokploy : build `runner`, labels Traefik, port interne 3000 et réseau externe `dokploy-network` pour `web`.
- `db` est limité au réseau interne `app-data` ; `postgres_data` reste le volume persistant.
- `POSTGRES_PASSWORD` et `APP_PASSWORD` doivent être définis dans l'environnement Dokploy.
- Le domaine est configuré via Dokploy pour le service `web`, port 3000, chemin `/`, avec HTTPS. Le contrôle de santé transmet les identifiants à `/api/health`.
- `docker-compose.local.yml` conserve le lancement local avec publication de port, sans dépendance à Traefik.
- La préparation des fichiers ne constitue pas un déploiement sur un serveur Dokploy.

## Direction visuelle retenue après retour utilisateur

L'utilisateur trouve les textes trop petits et le thème clair trop pâle. Il demande une ambiance orange, sportive, énergique, orientée focus, motivation et réalisation.

- Thème anthracite avec accents orange vif, textes clairs et contrastes renforcés sur tous les écrans et graphiques.
- Texte courant de 18 px, descriptions de 17–18 px, formulaires de 18 px, boutons de 16 px et grands indicateurs chiffrés. Les légendes secondaires sont généralement de 13–15 px ; la navigation mobile abrégée reste à 12 px.
- Bandeau « Mode focus — Construis ta force » et illustration vectorielle d'un athlète avec haltères.
- Navigation mobile aux libellés abrégés et cibles tactiles agrandies ; formulaires et grilles adaptés sans réduire les textes pour les faire tenir.
