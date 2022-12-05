import app, { init } from "@/app";
import supertest from "supertest";
import * as factory from "../factories";
import { TicketStatus } from "@prisma/client";
import { cleanDb, generateValidToken } from "../helpers";
import { createTicket } from "@/controllers";
import httpStatus from "http-status";
import { workerData } from "worker_threads";
const server = supertest(app);

beforeAll(async () => {
  await init();
});

beforeEach(async () => {
  await cleanDb();
});

describe("GET /booking", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.get("/booking");

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status", async () => {
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
  });
});

describe("POST /booking", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.post("/booking");

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status", async () => {
    const user = await factory.createUser();
    const token = await generateValidToken(user);
    const enrollment = await factory.createEnrollmentWithAddress(user);
    const ticketType = await factory.createTicketTypeWithHotel();
    const ticket = await factory.createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
    await factory.createPayment(ticket.id, ticketType.price);
    const hotel = await factory.createHotel();
    const roomA = await factory.createRoomWithHotelId(hotel.id);
    // const roomB = await factory.createRoomWithHotelId(hotel.id);
    // await factory.createBooking(user.id, roomA.id);
    const body =  { roomId: roomA.id };
    const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body);
    console.log(response.status);
    console.log(response.body);
  });
});

describe("POST /booking", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.post("/booking");

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status", async () => {
    const user = await factory.createUser();
    const token = await generateValidToken(user);
    const enrollment = await factory.createEnrollmentWithAddress(user);
    const ticketType = await factory.createTicketTypeWithHotel();
    const ticket = await factory.createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
    await factory.createPayment(ticket.id, ticketType.price);
    const hotel = await factory.createHotel();
    const roomA = await factory.createRoomWithHotelId(hotel.id);
    const roomB = await factory.createRoomWithHotelId(hotel.id);
    await factory.createBooking(user.id, roomA.id);
    const body =  { roomId: roomB.id };
    const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body);
    console.log(response.status);
    console.log(response.body);
  });
});

