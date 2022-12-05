import app, { init } from "@/app";
import supertest from "supertest";
import * as factory from "../factories";
import { TicketStatus } from "@prisma/client";
import { cleanDb, generateValidToken } from "../helpers";
import httpStatus from "http-status";
import faker from "@faker-js/faker";
import * as jwt from "jsonwebtoken";
import { prisma } from "@/config";
import exp from "constants";
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

  it("should with status 401 if token is not valid", async () => {
    const token = faker.lorem.word();

    const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should response with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await factory.createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("when token is valid", () => {
    it("should respond with status 402 when user ticket is remote ", async () => {
      const user = await factory.createUser();
      const token = await generateValidToken(user);
      const enrollment = await factory.createEnrollmentWithAddress(user);
      const ticketType = await factory.createTicketTypeRemote();
      const ticket = await factory.createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await factory.createPayment(ticket.id, ticketType.price);

      const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);

      expect(response.status).toEqual(httpStatus.PAYMENT_REQUIRED);
    });

    it("should respond with status 200 and booking", async () => {
      const user = await factory.createUser();
      const token = await generateValidToken(user);
      const enrollment = await factory.createEnrollmentWithAddress(user);
      const ticketType = await factory.createTicketTypeWithHotel();
      const ticket = await factory.createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await factory.createPayment(ticket.id, ticketType.price);
      const hotel = await factory.createHotel();
      const room = await factory.createRoomWithHotelId(hotel.id);
      const booking = await factory.createBooking(user.id, room.id);
      const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);
      expect(response.status).toEqual(httpStatus.OK);
      expect(response.body).toEqual({
        id: booking.id,
        Room: {
          id: room.id,
          name: room.name,
          capacity: room.capacity,
          hotelId: room.hotelId,
          createdAt: room.createdAt.toISOString(),
          updatedAt: room.updatedAt.toISOString(),
        }
      });
    });

    it("should respond with status 404 not have booking", async () => {
      const user = await factory.createUser();
      const token = await generateValidToken(user);
      const enrollment = await factory.createEnrollmentWithAddress(user);
      const ticketType = await factory.createTicketTypeWithHotel();
      const ticket = await factory.createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await factory.createPayment(ticket.id, ticketType.price);
      const hotel = await factory.createHotel();
      await factory.createRoomWithHotelId(hotel.id);
      const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);
      expect(response.status).toEqual(httpStatus.NOT_FOUND);
    });
  });
});

describe("POST /booking", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.post("/booking");

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should with status 401 if token is not valid", async () => {
    const token = faker.lorem.word();

    const response = await server.post("/booking").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should response with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await factory.createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.post("/booking").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("when token is valid", () => {
    it("should respond with status 402 when user ticket is remote ", async () => {
      const user = await factory.createUser();
      const token = await generateValidToken(user);
      const enrollment = await factory.createEnrollmentWithAddress(user);
      const ticketType = await factory.createTicketTypeRemote();
      const ticket = await factory.createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await factory.createPayment(ticket.id, ticketType.price);

      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`);

      expect(response.status).toEqual(httpStatus.PAYMENT_REQUIRED);
    });

    it("should respond with status 200  if valid roomId - nominal", async () => {
      const user = await factory.createUser();
      const token = await generateValidToken(user);
      const enrollment = await factory.createEnrollmentWithAddress(user);
      const ticketType = await factory.createTicketTypeWithHotel();
      const ticket = await factory.createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await factory.createPayment(ticket.id, ticketType.price);
      const hotel = await factory.createHotel();
      const roomA = await factory.createRoomWithHotelId(hotel.id);
      const body = { roomId: roomA.id };
      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body);
      const booking = await prisma.booking.findFirst({ where: { id: response.body.bookingId } });
      expect(response.status).toBe(httpStatus.OK);
      expect(response.body).toEqual({ bookingId: booking.id });
    });

    it("should respond with status 403 and not room booking if valid roomId - nominal", async () => {
      const user = await factory.createUser();
      const token = await generateValidToken(user);
      const enrollment = await factory.createEnrollmentWithAddress(user);
      const ticketType = await factory.createTicketTypeWithHotel();
      const ticket = await factory.createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await factory.createPayment(ticket.id, ticketType.price);
      const hotel = await factory.createHotel();
      const roomA = await factory.createRoomWithHotelIdCapacityZero(hotel.id);
      const body = { roomId: roomA.id };
      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body);
      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });

    it("should respond with status  404 if valid roomId - valor limite min", async () => {
      const user = await factory.createUser();
      const token = await generateValidToken(user);
      const enrollment = await factory.createEnrollmentWithAddress(user);
      const ticketType = await factory.createTicketTypeWithHotel();
      const ticket = await factory.createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await factory.createPayment(ticket.id, ticketType.price);
      const body = { roomId: 1 };
      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body);
      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });

    it("should respond with status 403  if valid roomId - valor limit min - 1", async () => {
      const user = await factory.createUser();
      const token = await generateValidToken(user);
      const enrollment = await factory.createEnrollmentWithAddress(user);
      const ticketType = await factory.createTicketTypeWithHotel();
      const ticket = await factory.createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await factory.createPayment(ticket.id, ticketType.price);
      const body = { roomId: 0 };
      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body);
      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });

    it("should respond with status 403  if valid roomId - valor max", async () => {
      const user = await factory.createUser();
      const token = await generateValidToken(user);
      const enrollment = await factory.createEnrollmentWithAddress(user);
      const ticketType = await factory.createTicketTypeWithHotel();
      const ticket = await factory.createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await factory.createPayment(ticket.id, ticketType.price);
      const body = { roomId: 2147483647 };
      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body);
      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });

    it("should respond with status 403  if valid roomId - valor max + 1", async () => {
      const user = await factory.createUser();
      const token = await generateValidToken(user);
      const enrollment = await factory.createEnrollmentWithAddress(user);
      const ticketType = await factory.createTicketTypeWithHotel();
      const ticket = await factory.createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await factory.createPayment(ticket.id, ticketType.price);
      const body = { roomId: 2147483647 + 1 };
      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body);
      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });
  });
});

describe("PUT/booking/:bookingId", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.put("/booking/1");

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should with status 401 if token is not valid", async () => {
    const token = faker.lorem.word();

    const response = await server.put("/booking/1").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should response with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await factory.createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.put("/booking/1").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("when token is valid", () => {
    it("should respond with status 402 when user ticket is remote ", async () => {
      const user = await factory.createUser();
      const token = await generateValidToken(user);
      const enrollment = await factory.createEnrollmentWithAddress(user);
      const ticketType = await factory.createTicketTypeRemote();
      const ticket = await factory.createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await factory.createPayment(ticket.id, ticketType.price);

      const response = await server.put("/booking/1").set("Authorization", `Bearer ${token}`);

      expect(response.status).toEqual(httpStatus.PAYMENT_REQUIRED);
    });

    it("should respond with status 200 if valid rommId - nominal and if valid bookingId - nominal ", async () => {
      const user = await factory.createUser();
      const token = await generateValidToken(user);
      const enrollment = await factory.createEnrollmentWithAddress(user);
      const ticketType = await factory.createTicketTypeWithHotel();
      const ticket = await factory.createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await factory.createPayment(ticket.id, ticketType.price);
      const hotel = await factory.createHotel();
      const roomA = await factory.createRoomWithHotelId(hotel.id);
      const roomB = await factory.createRoomWithHotelId(hotel.id);
      const booking = await factory.createBooking(user.id, roomA.id);
      const body = { roomId: roomB.id };
      const response = await server.put(`/booking/${booking.id}`).set("Authorization", `Bearer ${token}`).send(body);
      const bookingUpdate = await prisma.booking.findFirst({ where: { id: response.body.bookingId } });
      expect(response.status).toBe(httpStatus.OK);
      expect(response.body).toEqual({ bookingId: bookingUpdate.id });
    });

    it("should respond with status 403 if valid rommId - nominal and if valid bookingId - valor limit min ", async () => {
      const user = await factory.createUser();
      const token = await generateValidToken(user);
      const enrollment = await factory.createEnrollmentWithAddress(user);
      const ticketType = await factory.createTicketTypeWithHotel();
      const ticket = await factory.createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await factory.createPayment(ticket.id, ticketType.price);
      const hotel = await factory.createHotel();
      const roomA = await factory.createRoomWithHotelId(hotel.id);
      const body = { roomId: roomA.id };
      const response = await server.put("/booking/1").set("Authorization", `Bearer ${token}`).send(body);
      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });

    it("should respond with status 403 if valid rommId - nominal and if valid bookingId - valor limit min - 1", async () => {
      const user = await factory.createUser();
      const token = await generateValidToken(user);
      const enrollment = await factory.createEnrollmentWithAddress(user);
      const ticketType = await factory.createTicketTypeWithHotel();
      const ticket = await factory.createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await factory.createPayment(ticket.id, ticketType.price);
      const hotel = await factory.createHotel();
      const roomA = await factory.createRoomWithHotelId(hotel.id);
      const body = { roomId: roomA.id };
      const response = await server.put("/booking/0").set("Authorization", `Bearer ${token}`).send(body);
      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });

    it("should respond with status 403 if valid rommId - nominal and if valid bookingId - valor limit max", async () => {
      const user = await factory.createUser();
      const token = await generateValidToken(user);
      const enrollment = await factory.createEnrollmentWithAddress(user);
      const ticketType = await factory.createTicketTypeWithHotel();
      const ticket = await factory.createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await factory.createPayment(ticket.id, ticketType.price);
      const hotel = await factory.createHotel();
      const roomA = await factory.createRoomWithHotelId(hotel.id);
      const body = { roomId: roomA.id };
      const response = await server.put("/booking/2147483647").set("Authorization", `Bearer ${token}`).send(body);
      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });

    it("should respond with status 403 if valid rommId - nominal and if valid bookingId - valor limit max + 1", async () => {
      const user = await factory.createUser();
      const token = await generateValidToken(user);
      const enrollment = await factory.createEnrollmentWithAddress(user);
      const ticketType = await factory.createTicketTypeWithHotel();
      const ticket = await factory.createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await factory.createPayment(ticket.id, ticketType.price);
      const hotel = await factory.createHotel();
      const roomA = await factory.createRoomWithHotelId(hotel.id);
      const body = { roomId: roomA.id };
      const response = await server.put(`/booking/${2147483647 + 1}`).set("Authorization", `Bearer ${token}`).send(body);
      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });

    it("should respond with status 404 if valid rommId - valor limit min and if valid bookingId - nominal ", async () => {
      const user = await factory.createUser();
      const token = await generateValidToken(user);
      const enrollment = await factory.createEnrollmentWithAddress(user);
      const ticketType = await factory.createTicketTypeWithHotel();
      const ticket = await factory.createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await factory.createPayment(ticket.id, ticketType.price);
      const hotel = await factory.createHotel();
      const roomA = await factory.createRoomWithHotelId(hotel.id);
      const booking = await factory.createBooking(user.id, roomA.id);
      const body = { roomId: 1 };
      const response = await server.put(`/booking/${booking.id}`).set("Authorization", `Bearer ${token}`).send(body);
      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });
 
    it("should respond with status 403 if valid rommId - valor limit min - 1 and if valid bookingId - nominal ", async () => {
      const user = await factory.createUser();
      const token = await generateValidToken(user);
      const enrollment = await factory.createEnrollmentWithAddress(user);
      const ticketType = await factory.createTicketTypeWithHotel();
      const ticket = await factory.createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await factory.createPayment(ticket.id, ticketType.price);
      const hotel = await factory.createHotel();
      const roomA = await factory.createRoomWithHotelId(hotel.id);
      const booking = await factory.createBooking(user.id, roomA.id);
      const body = { roomId: 0 };
      const response = await server.put(`/booking/${booking.id}`).set("Authorization", `Bearer ${token}`).send(body);
      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });

    it("should respond with status 403 if valid rommId - valor limit max and if valid bookingId - nominal ", async () => {
      const user = await factory.createUser();
      const token = await generateValidToken(user);
      const enrollment = await factory.createEnrollmentWithAddress(user);
      const ticketType = await factory.createTicketTypeWithHotel();
      const ticket = await factory.createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await factory.createPayment(ticket.id, ticketType.price);
      const hotel = await factory.createHotel();
      const roomA = await factory.createRoomWithHotelId(hotel.id);
      const booking = await factory.createBooking(user.id, roomA.id);
      const body = { roomId: 2147483647 };
      const response = await server.put(`/booking/${booking.id}`).set("Authorization", `Bearer ${token}`).send(body);
      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });

    it("should respond with status 403 if valid rommId - valor limit max + 1 and if valid bookingId - nominal ", async () => {
      const user = await factory.createUser();
      const token = await generateValidToken(user);
      const enrollment = await factory.createEnrollmentWithAddress(user);
      const ticketType = await factory.createTicketTypeWithHotel();
      const ticket = await factory.createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await factory.createPayment(ticket.id, ticketType.price);
      const hotel = await factory.createHotel();
      const roomA = await factory.createRoomWithHotelId(hotel.id);
      const booking = await factory.createBooking(user.id, roomA.id);
      const body = { roomId: 2147483647 + 1 };
      const response = await server.put(`/booking/${booking.id}`).set("Authorization", `Bearer ${token}`).send(body);
      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });
  });
});

