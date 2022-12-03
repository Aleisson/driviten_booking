import app, { init } from "@/app";
import supertest from "supertest";
import * as factory from "../factories";
import { TicketStatus } from "@prisma/client";
import { cleanDb, generateValidToken } from "../helpers";
import { createTicket } from "@/controllers";
const server = supertest(app);

beforeAll(async () => {
  await init();
});

beforeEach(async () => {
  await cleanDb();
});

describe("GET /booking", () => {
  it("Should respond with status", async () => {
    const user = await factory.createUser();
    const token = await generateValidToken(user);
    const enrollment = await factory.createEnrollmentWithAddress(user);
    const ticketType = await factory.createTicketTypeWithHotel();
    const ticket = await factory.createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
    await factory.createPayment(ticket.id, ticketType.price);
    const hotel = await factory.createHotel();
    const room = await factory.createRoomWithHotelId(hotel.id);
    await factory.createBooking(user.id, room.id);
    const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);
    console.log(response.statusCode);
    console.log(response.body);
  });
});
