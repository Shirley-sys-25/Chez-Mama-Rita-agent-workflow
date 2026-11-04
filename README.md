# Chez Mama Rita — Agent Workflow

> Préparer un projet **avant** de le confier à un agent IA : comprendre, structurer, découper, encadrer. Le code vient en dernier.

Exercice de la formation **AI Factory Builder** (The InnerBuild) — projet fictif : digitaliser la prise de commande d'un restaurant de quartier à Cotonou.

## Le projet en bref

**Chez Mama Rita** : 3 salles, 1 cuisine, 1 caisse, 1 gérant. Aujourd'hui : commandes sur papier, serveurs qui crient en cuisine, erreurs de facturation le soir.

**Objectif** : une application web responsive (téléphone, tablette, PC) où :
- le **serveur** prend la commande à table et l'envoie en cuisine ;
- le **cuisinier** voit les commandes et les marque *en préparation* puis *prête* ;
- le **caissier** encaisse, imprime la facture et clôture la table ;
- le **gérant** gère le menu et les prix, et consulte les ventes du jour.

**Hors périmètre** : paiement mobile en ligne, gestion des stocks, fidélité, multi-restaurants.

## État du dépôt

| Phase | Statut |
|---|---|
| Préparation (docs, règles agent, plan) | ✅ Fait |
| Tests écrits avant le code (`tests/`) | ✅ Écrits (rouges tant que le code n'existe pas) |
| Code applicatif (`server/`, `client/`) | ⏳ À venir, délégué à l'agent suivant `docs/04-plan.md` |

## Lire le dépôt (dans cet ordre)

1. [`docs/01-comprehension.md`](docs/01-comprehension.md) — le besoin, les questions ouvertes, les hypothèses
2. [`docs/02-acteurs-et-interactions.md`](docs/02-acteurs-et-interactions.md) — qui fait quoi, diagrammes Mermaid
3. [`docs/03-architecture.md`](docs/03-architecture.md) — stack justifiée, modèle de données, arborescence cible
4. [`docs/04-plan.md`](docs/04-plan.md) — tâches courtes, critères d'acceptation, dépendances
5. [`docs/05-workflow.md`](docs/05-workflow.md) — ce qui est délégué à l'agent, ce qu'un humain valide
6. [`AGENTS.md`](AGENTS.md) — règles permanentes de l'agent (`CLAUDE.md` le référence)
7. [`tests/`](tests/) — les tests qui définissent le comportement attendu
8. [`journal.md`](journal.md) — trace des échanges avec l'agent et des décisions

## Lancer le workflow

1. Ouvrir le dépôt dans l'agent de son choix (Claude Code, Cursor, Codex…). Il lit `AGENTS.md` (ou `CLAUDE.md`) automatiquement.
2. Donner la consigne : *« Lis AGENTS.md puis docs/04-plan.md. Exécute la prochaine tâche non terminée (T01 pour commencer). »*
3. L'agent travaille **une tâche à la fois**, sur une branche dédiée, et doit **prouver** qu'elle est finie (sortie des tests collée dans sa réponse).
4. L'humain relit le diff, lance les tests lui-même, valide, puis fusionne. Voir `docs/05-workflow.md`.
5. Répéter jusqu'à la dernière tâche du plan.

## Lancer les tests (une fois T01 terminée)

```bash
npm install
cp .env.example .env
npm test
```

Les tests sont écrits **avant** le code (TDD) : ils échouent tant que la fonctionnalité correspondante n'est pas implémentée. C'est voulu.

## Stack cible

TypeScript · Node.js + Express · Socket.IO · PostgreSQL + Prisma · React + Vite (PWA) · Vitest + Supertest.
Justification complète dans `docs/03-architecture.md`.

## Auteure

Shirley — formation AI Factory Builder, The InnerBuild.
