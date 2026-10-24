const mongoose = require("mongoose");
const { VEHICLE_TYPES } = require("../constants/parking");

const pricingRuleSchema = new mongoose.Schema({
  parkingLotId: { type: mongoose.Schema.Types.ObjectId, ref: "ParkingLot", required: true, index: true },
  vehicleType: { type: String, enum: VEHICLE_TYPES, required: true },
  hourlyRate: { type: Number, required: true, min: 0 },
  billingMode: { type: String, enum: ["CEIL_HOUR"], default: "CEIL_HOUR" },
  currency: { type: String, default: "INR" },
  version: { type: Number, default: 1 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

pricingRuleSchema.index({ parkingLotId: 1, vehicleType: 1, isActive: 1 });
module.exports = mongoose.model("PricingRule", pricingRuleSchema);
