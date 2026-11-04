import { describe, it, expect, beforeEach } from "vitest";
import { as, setup } from "../helpers/api";

let ctx: Awaited<ReturnType<typeof setup>>;

beforeEach(async () => {
  ctx = await setup();
});

const newOrder = (clientId = "c-1") => ({
  clientId,
  tableId: ctx.tableId,
  items: [{ menuItemId: ctx.menuItems[0].id, quantity: 2, note: "sans piment" }],
});

describe("Prise de commande par table", () => {
  it("un serveur crée une commande au statut RECUE", async () => {
    const res = await as("SERVEUR").post("/api/orders").send(newOrder());
    expect(res.status).toBe(201);
    expect(res.body.status).toBe("RECUE");
    expect(res.body.items).toHaveLength(1);
  });

  it("fige le prix du plat dans la ligne de commande", async () => {
    const res = await as("SERVEUR").post("/api/orders").send(newOrder());
    expect(res.body.items[0].unitPriceFcfa).toBe(ctx.menuItems[0].priceFcfa);
  });

  it("est idempotente : un même clientId ne crée qu'une commande (mode hors ligne)", async () => {
    const a = await as("SERVEUR").post("/api/orders").send(newOrder("dup-1"));
    const b = await as("SERVEUR").post("/api/orders").send(newOrder("dup-1"));
    expect(b.body.id).toBe(a.body.id);
    const kitchen = await as("CUISINIER").get("/api/kitchen/orders");
    expect(kitchen.body).toHaveLength(1);
  });

  it("refuse un plat indisponible", async () => {
    await as("GERANT").patch(`/api/menu/${ctx.menuItems[0].id}`).send({ available: false });
    const res = await as("SERVEUR").post("/api/orders").send(newOrder());
    expect(res.status).toBe(422);
  });

  it("un cuisinier ne peut pas créer de commande", async () => {
    const res = await as("CUISINIER").post("/api/orders").send(newOrder());
    expect(res.status).toBe(403);
  });
});

describe("Modification après envoi en cuisine", () => {
  it("autorise l'ajout d'un plat en EN_PREPARATION", async () => {
    const order = (await as("SERVEUR").post("/api/orders").send(newOrder())).body;
    await as("CUISINIER").patch(`/api/orders/${order.id}/status`).send({ status: "EN_PREPARATION" });
    const res = await as("SERVEUR")
      .post(`/api/orders/${order.id}/items`)
      .send({ menuItemId: ctx.menuItems[1].id, quantity: 1 });
    expect(res.status).toBe(201);
  });

  it("refuse le retrait par le serveur en EN_PREPARATION, accepte par le gérant", async () => {
    const order = (await as("SERVEUR").post("/api/orders").send(newOrder())).body;
    await as("CUISINIER").patch(`/api/orders/${order.id}/status`).send({ status: "EN_PREPARATION" });
    const itemId = order.items[0].id;

    const refused = await as("SERVEUR").delete(`/api/orders/${order.id}/items/${itemId}`);
    expect(refused.status).toBe(403);

    const accepted = await as("GERANT").delete(`/api/orders/${order.id}/items/${itemId}`);
    expect(accepted.status).toBe(200);
  });

  it("refuse tout ajout une fois la commande PRETE", async () => {
    const order = (await as("SERVEUR").post("/api/orders").send(newOrder())).body;
    await as("CUISINIER").patch(`/api/orders/${order.id}/status`).send({ status: "EN_PREPARATION" });
    await as("CUISINIER").patch(`/api/orders/${order.id}/status`).send({ status: "PRETE" });
    const res = await as("SERVEUR")
      .post(`/api/orders/${order.id}/items`)
      .send({ menuItemId: ctx.menuItems[1].id, quantity: 1 });
    expect(res.status).toBe(409);
  });
});
