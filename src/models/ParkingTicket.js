const mongoose = require("mongoose");
const { TICKET_STATUS } = require("../constants/parking");

const parkingTicketSchema = new mongoose.Schema({
  ticketNumber: { type: String, required: true, unique: true },
  vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle", required: true, index: true },
  parkingLotId: { type: mongoose.Schema.Types.ObjectId, ref: "ParkingLot", required: true, index: true },
  spotId: { type: mongoose.Schema.Types.ObjectId, ref: "ParkingSpot", required: true },
  entryTime: { type: Date, required: true, default: Date.now },
  exitTime: { type: Date, default: null },
  status: { type: String, enum: TICKET_STATUS, default: "ACTIVE", index: true },
  feeAmount: { type: Number, default: null, min: 0 },
  pricingVersion: { type: Number, required: true, default: 1 }
}, { timestamps: true });

parkingTicketSchema.index({ vehicleId: 1, entryTime: -1 });
parkingTicketSchema.index(
  { spotId: 1 },
  { unique: true, partialFilterExpression: { status: "ACTIVE" } }
);
parkingTicketSchema.index(
  { vehicleId: 1 },
  { unique: true, partialFilterExpression: { status: "ACTIVE" } }
);
module.exports = mongoose.model("ParkingTicket", parkingTicketSchema);
