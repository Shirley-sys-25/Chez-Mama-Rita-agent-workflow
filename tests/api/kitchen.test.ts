import { describe, it, expect, beforeEach } from "vitest";
import { as, setup } from "../helpers/api";

let ctx: Awaited<ReturnType<typeof setup>>;
let orderId: string;

beforeEach(async () => {
  ctx = await setup();
  const res = await as("SERVEUR").post("/api/orders").send({
    clientId: "k-1",
    tableId: ctx.tableId,
    items: [{ menuItemId: ctx.menuItems[0].id, quantity: 1 }],
  });
  orderId = res.body.id;
});

describe("Cuisine : commandes et statuts", () => {
  it("la commande envoyée apparaît côté cuisine avec le statut RECUE", async () => {
    const res = await as("CUISINIER").get("/api/kitchen/orders");
    expect(res.status).toBe(200);
    expect(res.body[0]).toMatchObject({ id: orderId, status: "RECUE" });
  });

  it("le cuisinier fait avancer RECUE → EN_PREPARATION → PRETE", async () => {
    const a = await as("CUISINIER").patch(`/api/orders/${orderId}/status`).send({ status: "EN_PREPARATION" });
    expect(a.body.status).toBe("EN_PREPARATION");
    const b = await as("CUISINIER").patch(`/api/orders/${orderId}/status`).send({ status: "PRETE" });
    expect(b.body.status).toBe("PRETE");
  });

  it("refuse de sauter une étape (RECUE → PRETE)", async () => {
    const res = await as("CUISINIER").patch(`/api/orders/${orderId}/status`).send({ status: "PRETE" });
    expect(res.status).toBe(409);
  });

  it("un serveur ne peut pas changer le statut de cuisine", async () => {
    const res = await as("SERVEUR").patch(`/api/orders/${orderId}/status`).send({ status: "EN_PREPARATION" });
    expect(res.status).toBe(403);
  });

  it("le cuisinier ne voit pas les prix", async () => {
    const res = await as("CUISINIER").get("/api/kitchen/orders");
    expect(JSON.stringify(res.body)).not.toContain("unitPriceFcfa");
  });
});
