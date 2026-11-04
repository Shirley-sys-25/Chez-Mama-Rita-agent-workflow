import { describe, it, expect, beforeEach } from "vitest";
import { as, setup } from "../helpers/api";

let ctx: Awaited<ReturnType<typeof setup>>;

beforeEach(async () => {
  ctx = await setup();
});

async function sellAndPay(clientId: string, menuIndex: number, qty: number) {
  const o = (
    await as("SERVEUR").post("/api/orders").send({
      clientId,
      tableId: ctx.tableId,
      items: [{ menuItemId: ctx.menuItems[menuIndex].id, quantity: qty }],
    })
  ).body;
  await as("CUISINIER").patch(`/api/orders/${o.id}/status`).send({ status: "EN_PREPARATION" });
  await as("CUISINIER").patch(`/api/orders/${o.id}/status`).send({ status: "PRETE" });
  const inv = (await as("CAISSIER").post(`/api/tables/${ctx.tableId}/invoice`)).body;
  await as("CAISSIER")
    .post(`/api/invoices/${inv.id}/pay`)
    .send({ method: "ESPECES", amountFcfa: inv.totalTtcFcfa });
  return inv;
}

describe("Tableau de bord du gérant", () => {
  it("affiche le total des ventes du jour", async () => {
    const a = await sellAndPay("d-1", 0, 2);
    const b = await sellAndPay("d-2", 1, 1);
    const res = await as("GERANT").get("/api/dashboard/daily");
    expect(res.status).toBe(200);
    expect(res.body.totalSalesFcfa).toBe(a.totalTtcFcfa + b.totalTtcFcfa);
    expect(res.body.ordersCount).toBe(2);
  });

  it("classe les plats les plus commandés", async () => {
    await sellAndPay("d-3", 0, 5);
    await sellAndPay("d-4", 1, 1);
    const res = await as("GERANT").get("/api/dashboard/daily");
    expect(res.body.topItems[0]).toMatchObject({ menuItemId: ctx.menuItems[0].id, quantity: 5 });
  });

  it("n'est pas accessible aux autres rôles", async () => {
    const res = await as("CAISSIER").get("/api/dashboard/daily");
    expect(res.status).toBe(403);
  });
});
