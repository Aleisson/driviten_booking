import app from "@/app";
import supertest from "supertest";

const server = supertest(app);

describe("GET /booking", () => {
  it("Should respond with status 501", async () => {
    const response = await server.get("/booking");

    expect(response.status).toBe(501);
  });
});
