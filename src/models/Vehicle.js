const mongoose = require("mongoose");
const { VEHICLE_TYPES } = require("../constants/parking");

const vehicleSchema = new mongoose.Schema({
  licensePlate: {
    type: String, required: true, trim: true, uppercase: true,
    set: (v) => v.replace(/\s+/g, "")
  },
  vehicleType: { type: String, enum: VEHICLE_TYPES, required: true }
}, { timestamps: true });

vehicleSchema.index({ licensePlate: 1 }, { unique: true });
module.exports = mongoose.model("Vehicle", vehicleSchema);
