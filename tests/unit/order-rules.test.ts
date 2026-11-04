import { describe, it, expect } from "vitest";
import {
  canTransition,
  canAddItem,
  canRemoveItem,
} from "../../server/src/domain/order-rules";

describe("transitions de statut", () => {
  it("autorise RECUE → EN_PREPARATION → PRETE → CLOTUREE", () => {
    expect(canTransition("RECUE", "EN_PREPARATION")).toBe(true);
    expect(canTransition("EN_PREPARATION", "PRETE")).toBe(true);
    expect(canTransition("PRETE", "CLOTUREE")).toBe(true);
  });

  it("refuse de sauter une étape ou de revenir en arrière", () => {
    expect(canTransition("RECUE", "PRETE")).toBe(false);
    expect(canTransition("PRETE", "EN_PREPARATION")).toBe(false);
    expect(canTransition("CLOTUREE", "RECUE")).toBe(false);
  });
});

describe("ajout d'un plat", () => {
  it("est libre en RECUE, autorisé en EN_PREPARATION", () => {
    expect(canAddItem("RECUE")).toBe(true);
    expect(canAddItem("EN_PREPARATION")).toBe(true);
  });

  it("est refusé en PRETE et CLOTUREE", () => {
    expect(canAddItem("PRETE")).toBe(false);
    expect(canAddItem("CLOTUREE")).toBe(false);
  });
});

describe("retrait d'un plat", () => {
  it("est libre en RECUE", () => {
    expect(canRemoveItem("RECUE", "SERVEUR")).toEqual({ allowed: true });
  });

  it("exige le gérant en EN_PREPARATION", () => {
    expect(canRemoveItem("EN_PREPARATION", "SERVEUR")).toEqual({
      allowed: false,
      reason: "VALIDATION_GERANT_REQUISE",
    });
    expect(canRemoveItem("EN_PREPARATION", "GERANT")).toEqual({ allowed: true });
  });

  it("est refusé en PRETE et CLOTUREE, même pour le gérant", () => {
    expect(canRemoveItem("PRETE", "GERANT").allowed).toBe(false);
    expect(canRemoveItem("CLOTUREE", "GERANT").allowed).toBe(false);
  });
});
