# 02 — Acteurs et interactions

## Acteurs et responsabilités

| Acteur | Appareil | Responsabilités | Ne peut pas |
|---|---|---|---|
| **Serveur** | Téléphone | Prendre la commande par table, l'envoyer en cuisine, la modifier selon son statut, voir l'état de ses commandes | Encaisser, modifier le menu, annuler un plat en préparation sans le gérant |
| **Cuisinier** | Écran cuisine | Voir les commandes à préparer, passer *en préparation* puis *prête* | Créer ou modifier une commande, voir les prix et les factures |
| **Caissier** | PC | Encaisser, choisir le mode de paiement, éditer/imprimer la facture, clôturer la table | Modifier le menu, changer le contenu d'une commande |
| **Gérant** | PC / téléphone | Gérer menu, prix, disponibilité, tables et comptes ; consulter le tableau de bord et les factures ; valider les annulations en préparation | — |
| **Système** | Serveur | Pousser les commandes en temps réel, calculer les totaux et la TVA, numéroter et archiver les factures, synchroniser le mode hors ligne | — |

## Vue d'ensemble

```mermaid
flowchart LR
    S[Serveur<br/>téléphone] -- crée / modifie commande --> API[(API + Base de données)]
    API -- temps réel --> K[Cuisinier<br/>écran cuisine]
    K -- statut : en préparation / prête --> API
    API -- notification : commande prête --> S
    C[Caissier<br/>PC] -- demande facture / encaisse --> API
    API -- facture PDF --> C
    G[Gérant] -- menu, prix, tables, comptes --> API
    API -- ventes du jour, top plats --> G
    G -. valide annulation .-> API
```

## Cycle de vie d'une commande

```mermaid
stateDiagram-v2
    [*] --> RECUE: serveur envoie
    RECUE --> EN_PREPARATION: cuisinier démarre
    EN_PREPARATION --> PRETE: cuisinier termine
    PRETE --> CLOTUREE: caissier encaisse
    RECUE --> [*]: annulée (serveur)
    note right of EN_PREPARATION
        Ajout de plat autorisé
        Annulation : validation gérant
    end note
    note right of PRETE
        Plus de modification
    end note
```

## Scénario principal : de la commande à la facture

```mermaid
sequenceDiagram
    actor Se as Serveur
    participant API as API
    actor Cu as Cuisinier
    actor Ca as Caissier
    actor Ge as Gérant

    Se->>API: POST commande (table 4, 2x poulet braisé, 1x jus)
    API->>API: valide, calcule le total TTC
    API-->>Cu: (WebSocket) nouvelle commande — statut RECUE
    Cu->>API: PATCH statut = EN_PREPARATION
    API-->>Se: (WebSocket) mise à jour du statut
    Cu->>API: PATCH statut = PRETE
    API-->>Se: (WebSocket) « Table 4 prête »
    Ca->>API: POST facture pour la table 4
    API-->>Ca: facture (HT, TVA, TTC) + PDF
    Ca->>API: POST paiement (mode : MOBILE_MONEY)
    API->>API: commandes CLOTUREE, facture archivée
    Ge->>API: GET tableau de bord du jour
    API-->>Ge: ventes du jour, plats les plus commandés
```

## Scénario : modification et annulation

```mermaid
sequenceDiagram
    actor Se as Serveur
    participant API as API
    actor Ge as Gérant
    Se->>API: ajoute 1 plat (commande EN_PREPARATION)
    API-->>Se: ✅ accepté, signalé en cuisine
    Se->>API: retire 1 plat (commande EN_PREPARATION)
    API-->>Se: ⛔ refusé : validation du gérant requise
    Ge->>API: valide l'annulation
    API-->>Se: ✅ plat annulé, cuisine prévenue
```

## Scénario : mode hors ligne (serveur)

```mermaid
sequenceDiagram
    actor Se as Serveur
    participant App as App (téléphone)
    participant API as API
    Se->>App: saisit une commande (réseau coupé)
    App->>App: stocke localement avec clientId unique
    App-->>Se: « En attente d'envoi »
    Note over App,API: le réseau revient
    App->>API: envoie les commandes en attente (clientId)
    API->>API: ignore les doublons (même clientId)
    API-->>App: confirmation, statuts à jour
```

## Échanges clés (résumé)

| De → Vers | Information | Mode |
|---|---|---|
| Serveur → Système | Nouvelle commande, ajout/retrait de plat | Requête HTTP (file locale si hors ligne) |
| Système → Cuisinier | Commande à préparer | Temps réel (WebSocket) |
| Cuisinier → Système | Changement de statut | Requête HTTP |
| Système → Serveur | Statut mis à jour, « commande prête » | Temps réel (WebSocket) |
| Caissier → Système | Demande de facture, paiement | Requête HTTP |
| Gérant → Système | Menu, prix, comptes, validation d'annulation | Requête HTTP |
| Système → Gérant | Ventes du jour, plats les plus commandés | Requête HTTP |
