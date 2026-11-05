# Journal de bord

Trace des échanges clés avec l'agent (Claude) et des décisions prises. Les dates sont en 2026.

## 4 novembre — Préparation du dépôt

**Demande** — Faire l'exercice « workflow agents IA » sur le projet fictif Chez Mama Rita : préparer le projet avant d'écrire du code.

**Échange 1 — Comprendre l'exercice.** L'agent a reformulé le but : on n'évalue pas le code mais la capacité à préparer un projet pour qu'un agent puisse le construire (comprendre → structurer → découper → encadrer). Il a rappelé la grille de notation et la date limite (6 novembre, 18 h).

**Échange 2 — Premières décisions techniques.**
- Application **web responsive** (serveurs sur téléphone, caisse sur PC, écran en cuisine).
- Agent IA : **pas encore décidé** → le dépôt doit fonctionner avec plusieurs agents (d'où `AGENTS.md` comme fichier principal, `CLAUDE.md` qui le référence).
- Stack : **TypeScript, Node, React** (celle que je maîtrise le mieux).

**Échange 3 — Questions de cadrage et réponses.**
- Connexion fiable, mais **mode hors ligne** à prévoir.
- Comptes **individuels** pour chaque utilisateur, avec un rôle.
- Interface en **français**, **FCFA sans décimales**, **TVA** incluse.
- Facture **imprimable** + **PDF conservé** pour la vérification de fin de journée.
- Modes de paiement : espèces, Mobile Money, carte, **enregistrés seulement** (compatible avec le hors périmètre).
- **PostgreSQL** retenu. Rendu limité à la **préparation + tests**.
- Ton de la publication LinkedIn : **personnel et réflexif**.

**Décision — les points techniques à trancher**. J’ai fait des recherches pour voir ce qui convenait le mieux au projet, selon la vision que j’en avais :
- *Statut de commande* : règle retenue — ajout libre en « reçue », ajout seul en « en préparation » (annulation avec validation du gérant), verrouillage dès « prête ».
- *WebSocket ou rafraîchissement* : **WebSocket** (Socket.IO), car la cuisine doit voir la commande instantanément.
- *Tests* : **Vitest + Supertest**, avec au moins un test par fonctionnalité principale.

**Décision — hypothèses validées** : TVA à 18 % incluse dans les prix ; mode hors ligne limité à la saisie par les serveurs.

**Échange 4 — Génération des fichiers.** L'agent a généré le README, `AGENTS.md`, `CLAUDE.md`, les cinq documents de `docs/`, les tests, et ce journal.

### Ce que j'ai observé de ma propre expérience avec les agents IA
- **Un agent peut annoncer qu'une tâche est faite alors qu'il n'a rien fait.** Sans vérification de ma part, impossible de le voir. → J'ai écrit dans `AGENTS.md` une règle de preuve obligatoire (sortie réelle des tests collée dans la réponse) et dans `docs/05-workflow.md` une étape où l'humain relance lui-même les tests.
- **Un agent applique souvent mal une modification et abîme le travail.** Je sauvegarde souvent et je reviens à l'ancienne version quand ça plante. → Règles ajoutées : une tâche par branche, petits commits, retour au dernier commit sain plutôt que d'empiler des correctifs.

### À faire ensuite
- Relire chaque fichier et corriger ce qui ne reflète pas mon avis.
- Publier le dépôt sur GitHub, puis écrire et publier le post LinkedIn.
- Envoyer le lien de la publication dans le groupe avant le 6 novembre, 18 h.
