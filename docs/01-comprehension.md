# 01 — Compréhension du besoin

## Reformulation

**Chez Mama Rita** est un restaurant de quartier à Cotonou (3 salles, 1 cuisine, 1 caisse, 1 gérant). Le circuit actuel est entièrement manuel : commande sur papier, transmission orale en cuisine, facturation à la main. Les conséquences : commandes mal transmises ou oubliées, attente mal maîtrisée, **erreurs de facturation découvertes le soir**.

Le restaurant veut **digitaliser la prise de commande** pour :
1. supprimer la transmission orale (la commande arrive seule en cuisine, avec un statut) ;
2. fiabiliser l'addition (calcul automatique, facture numérotée, archivée) ;
3. donner au gérant de la visibilité (ventes du jour, plats les plus commandés) et le contrôle du menu.

## Problème → réponse

| Problème actuel | Réponse du produit |
|---|---|
| Serveurs qui crient en cuisine | Envoi automatique de la commande à l'écran cuisine (temps réel) |
| Commande perdue ou mal lue | Commande saisie par le serveur, lisible, avec statut suivi |
| Erreurs de facturation | Total calculé par le système, TVA incluse, facture numérotée et archivée en PDF |
| Gérant sans visibilité | Tableau de bord : ventes du jour, plats les plus commandés |
| Prix ou plats indisponibles non à jour | Gestion du menu (prix, disponibilité) par le gérant |

## Périmètre

**Inclus** : gestion du menu ; commande par table ; envoi en cuisine avec statuts *reçue → en préparation → prête* ; encaissement, facture imprimable et PDF ; tableau de bord gérant ; comptes individuels par rôle ; mode hors ligne pour la prise de commande des serveurs.

**Hors périmètre** (explicite) : paiement mobile en ligne, gestion des stocks, fidélité, multi-restaurants.

> Précision : le caissier peut **enregistrer** le mode de paiement (espèces, Mobile Money, carte) comme information. Aucune transaction en ligne n'est effectuée par l'application. Cela reste compatible avec le hors périmètre.

## Décisions prises avec la porteuse du projet

- Application **web responsive** (téléphone des serveurs, PC de la caisse, écran de cuisine).
- **Comptes individuels** pour chaque utilisateur, avec un rôle.
- Interface en **français**, monnaie **FCFA sans décimales**.
- **TVA** : 18 %, incluse dans les prix du menu.
- Facture simple **imprimable** + **PDF conservé** dans l'application pour vérification de fin de journée (gérant et caissier).
- Connexion en principe fiable, mais **mode hors ligne** à prévoir pour les serveurs.
- Un serveur peut modifier une commande après envoi en cuisine, selon son statut (voir règle ci-dessous).

### Règle de modification d'une commande

| Statut | Ajouter un plat | Retirer / annuler un plat |
|---|---|---|
| Reçue | ✅ libre | ✅ libre |
| En préparation | ✅ autorisé (signalé en cuisine) | ⚠️ validation du gérant requise |
| Prête | ❌ (nouvelle commande sur la même table) | ❌ |
| Clôturée | ❌ | ❌ |

## Questions ouvertes

| # | Question | À poser à | Hypothèse retenue en attendant |
|---|---|---|---|
| Q1 | Le taux de TVA applicable au restaurant est-il bien de 18 % ? | Gérant / comptable | 18 %, configurable |
| Q2 | Le restaurant a-t-il un IFU à imprimer sur la facture ? | Gérant | Champ optionnel dans les paramètres |
| Q3 | Quelle imprimante à la caisse (A4, ticket thermique) ? | Caissier | Impression navigateur (CSS d'impression), format ticket étroit |
| Q4 | Qui valide une annulation en cours de préparation ? | Gérant | Le rôle `GERANT`, depuis son compte |
| Q5 | Une table peut-elle avoir plusieurs commandes successives ? | Serveurs | Oui ; une facture regroupe toutes les commandes non payées de la table |
| Q6 | Faut-il un numéro de facture continu par jour ou par an ? | Gérant | Numérotation continue `F-AAAAMMJJ-0001` par jour |
| Q7 | Combien de serveurs, de postes caisse et d'écrans cuisine simultanés ? | Gérant | ~10 serveurs, 1 caisse, 1 écran cuisine |
| Q8 | Jusqu'où va le mode hors ligne ? | Gérant | Serveurs seulement : saisie locale + synchronisation au retour du réseau |
| Q9 | Comment gère-t-on une table qui change de salle ou fusionne ? | Serveurs | Hors périmètre de la v1 |
| Q10 | Un plat peut-il avoir des options (cuisson, sans piment) ? | Cuisinier | Un champ `note` libre par ligne de commande |

## Hypothèses

- **H1** — 3 salles ; les tables sont préconfigurées par le gérant (nom + salle).
- **H2** — Les prix du menu sont affichés et stockés **TTC** ; HT et TVA sont calculés à partir du TTC.
- **H3** — Le mode hors ligne concerne uniquement la **saisie de commande par les serveurs** ; la cuisine, la caisse et le tableau de bord nécessitent le réseau.
- **H4** — Les commandes créées hors ligne portent un identifiant client unique (`clientId`) pour éviter les doublons à la synchronisation.
- **H5** — Un plat indisponible n'apparaît plus dans la prise de commande mais reste dans l'historique.
- **H6** — Le tableau de bord se base sur les commandes **encaissées** du jour (fuseau Africa/Porto-Novo).
- **H7** — Les mots de passe sont créés par le gérant ; pas de récupération par email en v1.
- **H8** — Une seule langue (français), un seul restaurant.

## Critères de succès du produit

- Un serveur envoie une commande en moins de 30 secondes depuis son téléphone.
- La cuisine voit la commande sans rafraîchir la page.
- Le total de la facture est toujours égal à la somme des lignes (aucun écart de FCFA).
- En fin de journée, le gérant retrouve toutes les factures du jour.
