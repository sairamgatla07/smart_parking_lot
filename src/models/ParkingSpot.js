const mongoose = require("mongoose");
const { SPOT_TYPES, SPOT_STATUS } = require("../constants/parking");

const parkingSpotSchema = new mongoose.Schema({
  parkingLotId: { type: mongoose.Schema.Types.ObjectId, ref: "ParkingLot", required: true, index: true },
  floorId: { type: mongoose.Schema.Types.ObjectId, ref: "ParkingFloor", required: true, index: true },
  spotNumber: { type: String, required: true, trim: true },
  spotType: { type: String, enum: SPOT_TYPES, required: true },
  status: { type: String, enum: SPOT_STATUS, default: "AVAILABLE", index: true },
  currentTicketId: { type: mongoose.Schema.Types.ObjectId, ref: "ParkingTicket", default: null }
}, { timestamps: true });

parkingSpotSchema.index({ floorId: 1, spotNumber: 1 }, { unique: true });
parkingSpotSchema.index({ parkingLotId: 1, status: 1, spotType: 1 });
module.exports = mongoose.model("ParkingSpot", parkingSpotSchema);
