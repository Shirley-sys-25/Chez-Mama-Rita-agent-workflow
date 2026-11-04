import request from "supertest";
import { createApp } from "../../server/src/app";
import { resetDb, seedTestData, tokenFor } from "../../server/src/testing";

export type Role = "SERVEUR" | "CUISINIER" | "CAISSIER" | "GERANT";

export const app = createApp();

export async function setup() {
  await resetDb();
  return seedTestData(); // { tableId, menuItems: [{ id, priceFcfa, ... }], ... }
}

export function as(role: Role) {
  const token = tokenFor(role);
  return {
    get: (url: string) => request(app).get(url).set("Authorization", `Bearer ${token}`),
    post: (url: string) => request(app).post(url).set("Authorization", `Bearer ${token}`),
    patch: (url: string) => request(app).patch(url).set("Authorization", `Bearer ${token}`),
    delete: (url: string) => request(app).delete(url).set("Authorization", `Bearer ${token}`),
  };
}
