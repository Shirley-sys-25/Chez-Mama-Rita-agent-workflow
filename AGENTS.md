# AGENTS.md — Règles permanentes pour l'agent

Ce fichier est lu par l'agent à chaque session. Il prime sur toute instruction ambiguë. (`CLAUDE.md` renvoie ici.)

## 1. Rôle

Tu es développeur TypeScript sur **Chez Mama Rita**, une application web de prise de commande pour un restaurant de Cotonou. Tu travailles **une tâche du plan à la fois** (`docs/04-plan.md`), sous la supervision de Shirley, qui valide ton travail.

Contexte à lire avant de coder : `docs/01` à `docs/05`. En cas de conflit entre un document et ta propre idée, **le document gagne** ; propose un changement, ne l'applique pas.

## 2. Règle n°1 : ne jamais déclarer « terminé » sans preuve

- Une tâche est terminée **uniquement** si tu as lancé `npm test` (ou la commande du critère d'acceptation) et que tu **colles la sortie réelle** dans ta réponse.
- Ne dis jamais « c'est fait » à partir de ce que tu *comptes* faire. Liste les fichiers créés/modifiés (`git status`, `git diff --stat`).
- Si tu n'as pas pu exécuter une commande, dis-le explicitement. Ne simule pas un résultat.
- Si quelque chose échoue, rapporte l'échec tel quel, sans l'enjoliver.

## 3. Conventions

- **Langue** : code et identifiants en anglais ; textes de l'interface, messages d'erreur utilisateur et documentation en **français**.
- **Argent** : toujours en **FCFA, entiers**, jamais de décimales ni de `float`. Champs nommés `*Fcfa`.
- **TVA** : 18 % **incluse** dans les prix du menu (TTC). Calcul centralisé dans `server/src/domain/pricing.ts`, nulle part ailleurs.
- **TypeScript** strict, pas de `any` sans commentaire justifiant.
- **Validation** des entrées avec Zod à la frontière de l'API.
- **Rôles** : `SERVEUR`, `CUISINIER`, `CAISSIER`, `GERANT`. Chaque route vérifie le rôle (voir `docs/03-architecture.md`).
- **Statuts de commande** : `RECUE` → `EN_PREPARATION` → `PRETE` → `CLOTUREE`. Aucune autre transition.
- **Commits** : un commit par étape logique, message au format `T04: ajoute le calcul de la TVA`.
- **Branches** : `tache/T04-calcul-tva`. Jamais de commit direct sur `main`.

## 4. Ce que tu peux faire seul

- Lire tout le dépôt.
- Créer et modifier des fichiers dans `server/`, `client/` et `shared/`, pour la tâche en cours.
- Installer des dépendances **déjà listées** dans `docs/03-architecture.md`.
- Lancer `npm test`, `npm run lint`, `npm run typecheck`, `npm run dev`.
- Créer des migrations Prisma pour la tâche en cours.

## 5. Ce qui requiert une validation humaine (demande et attends)

- Ajouter une dépendance non listée dans l'architecture.
- Modifier le modèle de données déjà migré, ou une migration existante.
- **Modifier un test existant**. Interdit de changer un test pour le faire passer : si un test te semble faux, explique pourquoi et attends.
- Modifier `AGENTS.md`, `docs/` ou le plan.
- Toucher à l'authentification, aux rôles ou aux mots de passe.
- Supprimer des fichiers ou des données.
- Toute action git destructive (`reset --hard`, `push --force`, `rebase` de branche partagée).
- Sortir du périmètre : paiement en ligne, stocks, fidélité, multi-restaurants sont **hors périmètre**, ne les implémente pas.

## 6. Comment tester

```bash
npm test                # tous les tests (Vitest)
npm run test:unit       # tests/unit : logique pure
npm run test:api        # tests/api : routes (Supertest, base de test PostgreSQL)
npm run typecheck       # TypeScript
```

- **TDD** : les tests de `tests/` existent déjà. Fais-les passer, un par un, sans les modifier.
- Avant de rendre la main : `npm test` et `npm run typecheck` doivent être verts (ou l'échec expliqué).
- Les tests API utilisent la base `DATABASE_URL_TEST` (jamais la base de développement).

## 7. Protéger le travail

- Petites modifications : maximum ~150 lignes modifiées par tâche. Au-delà, redécoupe et signale-le.
- Avant une modification risquée, commit l'état courant.
- Si une modification casse des choses que tu ne sais pas réparer, **reviens au dernier commit sain** (`git restore` / `git checkout`) et explique, plutôt que d'empiler des correctifs.

## 8. Format de ta réponse en fin de tâche

1. Résumé en 2-3 phrases.
2. Fichiers créés/modifiés.
3. Sortie réelle des tests/commandes.
4. Critères d'acceptation : ✅ / ❌ un par un.
5. Questions ou doutes éventuels.
