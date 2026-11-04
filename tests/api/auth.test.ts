import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { app, setup } from "../helpers/api";

beforeEach(async () => {
  await setup();
});

describe("Authentification", () => {
  it("refuse une route protégée sans jeton", async () => {
    const res = await request(app).get("/api/menu");
    expect(res.status).toBe(401);
  });

  it("refuse un mauvais mot de passe", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "serveur@mamarita.test", password: "faux" });
    expect(res.status).toBe(401);
  });

  it("renvoie un jeton et le rôle pour des identifiants valides", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "serveur@mamarita.test", password: "test-password" });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeTruthy();
    expect(res.body.user.role).toBe("SERVEUR");
  });
});
