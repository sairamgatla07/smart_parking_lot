const mongoose = require("mongoose");
const ParkingLot = require("../models/ParkingLot");
const ParkingSpot = require("../models/ParkingSpot");
const Vehicle = require("../models/Vehicle");
const ParkingTicket = require("../models/ParkingTicket");
const PricingRule = require("../models/PricingRule");
const allocation = require("./SpotAllocationService");
const feeCalculator = require("./FeeCalculator");

function makeTicketNumber() {
  return `PK-${Date.now()}-${Math.floor(Math.random() * 100000).toString().padStart(5, "0")}`;
}

class ParkingService {
  async checkIn({ licensePlate, vehicleType, parkingLotId }) {
    if (!mongoose.isValidObjectId(parkingLotId)) {
      const error = new Error("A valid parkingLotId is required.");
      error.status = 400;
      throw error;
    }
    licensePlate = String(licensePlate || "").toUpperCase().replace(/\s+/g, "");
    if (!licensePlate || !vehicleType) {
      const error = new Error("licensePlate and vehicleType are required.");
      error.status = 400;
      throw error;
    }

    const lot = await ParkingLot.findOne({ _id: parkingLotId, isActive: true });
    if (!lot) {
      const error = new Error("Parking lot not found or inactive.");
      error.status = 404;
      throw error;
    }

    const session = await mongoose.startSession();
    let result;
    try {
      await session.withTransaction(async () => {
        let vehicle = await Vehicle.findOne({ licensePlate }).session(session);
        if (vehicle && vehicle.vehicleType !== vehicleType) {
          const error = new Error("This license plate is registered with a different vehicle type.");
          error.status = 409;
          throw error;
        }
        if (!vehicle) {
          [vehicle] = await Vehicle.create([{ licensePlate, vehicleType }], { session });
        }

        const activeTicket = await ParkingTicket.findOne({ vehicleId: vehicle._id, status: "ACTIVE" }).session(session);
        if (activeTicket) {
          const error = new Error("This vehicle already has an active parking ticket.");
          error.status = 409;
          throw error;
        }

        const pricing = await PricingRule.findOne({
          parkingLotId, vehicleType, isActive: true
        }).sort({ version: -1 }).session(session);
        if (!pricing) {
          const error = new Error(`No active pricing rule for ${vehicleType}.`);
          error.status = 500;
          throw error;
        }

        const ticketId = new mongoose.Types.ObjectId();
        const spot = await allocation.findAndReserveSpot({ parkingLotId, vehicleType, ticketId, session });
        const entryTime = new Date();
        const [ticket] = await ParkingTicket.create([{
          _id: ticketId,
          ticketNumber: makeTicketNumber(),
          vehicleId: vehicle._id,
          parkingLotId,
          spotId: spot._id,
          entryTime,
          status: "ACTIVE",
          pricingVersion: pricing.version
        }], { session });
        result = { ticket, vehicle, spot, pricing };
      });
      return result;
    } finally {
      await session.endSession();
    }
  }

  async checkOut(ticketId) {
    if (!mongoose.isValidObjectId(ticketId)) {
      const error = new Error("Invalid ticket ID.");
      error.status = 400;
      throw error;
    }
    const session = await mongoose.startSession();
    let result;
    try {
      await session.withTransaction(async () => {
        const ticket = await ParkingTicket.findOne({ _id: ticketId, status: "ACTIVE" }).session(session);
        if (!ticket) {
          const error = new Error("Active ticket not found; it may already be checked out.");
          error.status = 404;
          throw error;
        }

        const vehicle = await Vehicle.findById(ticket.vehicleId).session(session);
        const pricing = await PricingRule.findOne({
          parkingLotId: ticket.parkingLotId,
          vehicleType: vehicle.vehicleType,
          version: ticket.pricingVersion
        }).session(session);
        if (!pricing) {
          const error = new Error("The pricing rule used for this ticket could not be found.");
          error.status = 500;
          throw error;
        }

        const exitTime = new Date();
        const charge = feeCalculator.calculate({
          entryTime: ticket.entryTime,
          exitTime,
          hourlyRate: pricing.hourlyRate,
          billingMode: pricing.billingMode
        });

        ticket.exitTime = exitTime;
        ticket.status = "COMPLETED";
        ticket.feeAmount = charge.feeAmount;
        await ticket.save({ session });

        const spot = await ParkingSpot.findOneAndUpdate(
          { _id: ticket.spotId, status: "OCCUPIED", currentTicketId: ticket._id },
          { $set: { status: "AVAILABLE", currentTicketId: null } },
          { new: true, session }
        );
        if (!spot) {
          const error = new Error("Spot state mismatch; checkout was not completed.");
          error.status = 409;
          throw error;
        }
        result = { ticket, vehicle, spot, charge, currency: pricing.currency };
      });
      return result;
    } finally {
      await session.endSession();
    }
  }

  async getAvailability(parkingLotId) {
    if (!mongoose.isValidObjectId(parkingLotId)) {
      const error = new Error("A valid parkingLotId query parameter is required.");
      error.status = 400;
      throw error;
    }
    const counts = await ParkingSpot.aggregate([
      { $match: { parkingLotId: new mongoose.Types.ObjectId(parkingLotId) } },
      { $group: { _id: { floorId: "$floorId", status: "$status", spotType: "$spotType" }, count: { $sum: 1 } } },
      { $sort: { "_id.floorId": 1, "_id.spotType": 1 } }
    ]);
    return counts;
  }

  async getTicket(ticketId) {
    if (!mongoose.isValidObjectId(ticketId)) {
      const error = new Error("Invalid ticket ID.");
      error.status = 400;
      throw error;
    }
    const ticket = await ParkingTicket.findById(ticketId)
      .populate("vehicleId", "licensePlate vehicleType")
      .populate("spotId", "spotNumber spotType floorId");
    if (!ticket) {
      const error = new Error("Ticket not found.");
      error.status = 404;
      throw error;
    }
    return ticket;
  }
}

module.exports = new ParkingService();
