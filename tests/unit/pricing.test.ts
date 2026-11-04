import { describe, it, expect } from "vitest";
import { splitVat, orderTotalFcfa, formatFcfa } from "../../server/src/domain/pricing";

describe("TVA 18 % incluse (FCFA, entiers)", () => {
  it("décompose un montant TTC en HT et TVA", () => {
    expect(splitVat(11800)).toEqual({ ttc: 11800, ht: 10000, vat: 1800 });
  });

  it("garde HT + TVA = TTC même quand la division n'est pas ronde", () => {
    const { ttc, ht, vat } = splitVat(2500);
    expect(ht + vat).toBe(ttc);
    expect(Number.isInteger(ht) && Number.isInteger(vat)).toBe(true);
  });

  it("renvoie zéro pour un montant nul", () => {
    expect(splitVat(0)).toEqual({ ttc: 0, ht: 0, vat: 0 });
  });
});

describe("total d'une commande", () => {
  it("additionne prix unitaire × quantité", () => {
    const items = [
      { unitPriceFcfa: 3500, quantity: 2, state: "ACTIVE" as const },
      { unitPriceFcfa: 1000, quantity: 1, state: "ACTIVE" as const },
    ];
    expect(orderTotalFcfa(items)).toBe(8000);
  });

  it("ignore les lignes annulées", () => {
    const items = [
      { unitPriceFcfa: 3500, quantity: 1, state: "ACTIVE" as const },
      { unitPriceFcfa: 2000, quantity: 1, state: "ANNULEE" as const },
    ];
    expect(orderTotalFcfa(items)).toBe(3500);
  });
});

describe("affichage FCFA", () => {
  it("formate sans décimales", () => {
    expect(formatFcfa(12500)).toMatch(/12\s?500\s?FCFA/);
  });
});
