import { describe, it, expect, beforeEach } from "vitest";
import { as, setup } from "../helpers/api";

beforeEach(async () => {
  await setup();
});

describe("Gestion du menu", () => {
  it("le gérant crée un plat avec un prix entier en FCFA", async () => {
    const res = await as("GERANT").post("/api/menu").send({
      name: "Poulet braisé",
      category: "Plats",
      priceFcfa: 3500,
    });
    expect(res.status).toBe(201);
    expect(res.body.priceFcfa).toBe(3500);
  });

  it("refuse un prix avec décimales", async () => {
    const res = await as("GERANT").post("/api/menu").send({
      name: "Jus",
      category: "Boissons",
      priceFcfa: 500.5,
    });
    expect(res.status).toBe(400);
  });

  it("un serveur ne peut pas modifier le menu", async () => {
    const res = await as("SERVEUR").post("/api/menu").send({
      name: "Test",
      category: "Plats",
      priceFcfa: 1000,
    });
    expect(res.status).toBe(403);
  });

  it("un plat indisponible n'apparaît pas pour le serveur", async () => {
    const created = await as("GERANT").post("/api/menu").send({
      name: "Plat épuisé",
      category: "Plats",
      priceFcfa: 2000,
    });
    await as("GERANT").patch(`/api/menu/${created.body.id}`).send({ available: false });

    const res = await as("SERVEUR").get("/api/menu");
    expect(res.body.map((m: { id: string }) => m.id)).not.toContain(created.body.id);
  });
});
