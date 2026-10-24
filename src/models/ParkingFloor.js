const mongoose = require("mongoose");

const parkingFloorSchema = new mongoose.Schema({
  parkingLotId: { type: mongoose.Schema.Types.ObjectId, ref: "ParkingLot", required: true, index: true },
  floorNumber: { type: Number, required: true, min: 0 },
  name: { type: String, required: true, trim: true }
}, { timestamps: true });

parkingFloorSchema.index({ parkingLotId: 1, floorNumber: 1 }, { unique: true });
module.exports = mongoose.model("ParkingFloor", parkingFloorSchema);
