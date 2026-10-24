const mongoose = require("mongoose");

const parkingLotSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  address: { type: String, default: "" },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model("ParkingLot", parkingLotSchema);
