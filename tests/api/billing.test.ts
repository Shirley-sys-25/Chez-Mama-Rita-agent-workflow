import { describe, it, expect, beforeEach } from "vitest";
import { as, setup } from "../helpers/api";

let ctx: Awaited<ReturnType<typeof setup>>;

async function readyOrder(clientId: string, qty: number) {
  const o = (
    await as("SERVEUR").post("/api/orders").send({
      clientId,
      tableId: ctx.tableId,
      items: [{ menuItemId: ctx.menuItems[0].id, quantity: qty }],
    })
  ).body;
  await as("CUISINIER").patch(`/api/orders/${o.id}/status`).send({ status: "EN_PREPARATION" });
  await as("CUISINIER").patch(`/api/orders/${o.id}/status`).send({ status: "PRETE" });
  return o;
}

beforeEach(async () => {
  ctx = await setup();
});

describe("Facture et encaissement", () => {
  it("génère une facture dont le total égale la somme des lignes", async () => {
    await readyOrder("b-1", 2);
    await readyOrder("b-2", 1);
    const res = await as("CAISSIER").post(`/api/tables/${ctx.tableId}/invoice`);
    expect(res.status).toBe(201);
    expect(res.body.totalTtcFcfa).toBe(ctx.menuItems[0].priceFcfa * 3);
    expect(res.body.totalHtFcfa + res.body.vatFcfa).toBe(res.body.totalTtcFcfa);
  });

  it("numérote les factures de façon unique au format F-AAAAMMJJ-0001", async () => {
    await readyOrder("b-3", 1);
    const res = await as("CAISSIER").post(`/api/tables/${ctx.tableId}/invoice`);
    expect(res.body.number).toMatch(/^F-\d{8}-\d{4}$/);
  });

  it("enregistre le paiement et clôture les commandes", async () => {
    await readyOrder("b-4", 1);
    const invoice = (await as("CAISSIER").post(`/api/tables/${ctx.tableId}/invoice`)).body;
    const pay = await as("CAISSIER")
      .post(`/api/invoices/${invoice.id}/pay`)
      .send({ method: "MOBILE_MONEY", amountFcfa: invoice.totalTtcFcfa });
    expect(pay.status).toBe(200);
    const kitchen = await as("CUISINIER").get("/api/kitchen/orders");
    expect(kitchen.body).toHaveLength(0);
  });

  it("refuse un montant différent du total", async () => {
    await readyOrder("b-5", 1);
    const invoice = (await as("CAISSIER").post(`/api/tables/${ctx.tableId}/invoice`)).body;
    const res = await as("CAISSIER")
      .post(`/api/invoices/${invoice.id}/pay`)
      .send({ method: "ESPECES", amountFcfa: invoice.totalTtcFcfa - 1 });
    expect(res.status).toBe(422);
  });

  it("refuse un double paiement", async () => {
    await readyOrder("b-6", 1);
    const invoice = (await as("CAISSIER").post(`/api/tables/${ctx.tableId}/invoice`)).body;
    const body = { method: "CARTE", amountFcfa: invoice.totalTtcFcfa };
    await as("CAISSIER").post(`/api/invoices/${invoice.id}/pay`).send(body);
    const again = await as("CAISSIER").post(`/api/invoices/${invoice.id}/pay`).send(body);
    expect(again.status).toBe(409);
  });

  it("fournit le PDF de la facture au caissier et au gérant, pas au serveur", async () => {
    await readyOrder("b-7", 1);
    const invoice = (await as("CAISSIER").post(`/api/tables/${ctx.tableId}/invoice`)).body;
    const ok = await as("GERANT").get(`/api/invoices/${invoice.id}/pdf`);
    expect(ok.status).toBe(200);
    expect(ok.headers["content-type"]).toContain("application/pdf");
    const ko = await as("SERVEUR").get(`/api/invoices/${invoice.id}/pdf`);
    expect(ko.status).toBe(403);
  });
});
