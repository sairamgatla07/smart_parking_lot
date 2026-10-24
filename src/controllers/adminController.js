const ParkingLot = require("../models/ParkingLot");
const ParkingFloor = require("../models/ParkingFloor");
const ParkingSpot = require("../models/ParkingSpot");
const PricingRule = require("../models/PricingRule");

exports.seed = async (_req, res, next) => {
  try {
    const existing = await ParkingLot.findOne({ name: "Demo Smart Parking Lot" });
    if (existing) return res.status(200).json({
      message: "Demo data already exists; use the existing parkingLotId.",
      parkingLotId: existing._id
    });

    const lot = await ParkingLot.create({ name: "Demo Smart Parking Lot", address: "Hyderabad" });
    const floors = await ParkingFloor.create([
      { parkingLotId: lot._id, floorNumber: 1, name: "Floor 1" },
      { parkingLotId: lot._id, floorNumber: 2, name: "Floor 2" }
    ]);

    const spots = [];
    for (const floor of floors) {
      for (let i = 1; i <= 3; i++) spots.push({
        parkingLotId: lot._id, floorId: floor._id,
        spotNumber: `F${floor.floorNumber}-M${i}`, spotType: "MOTORCYCLE"
      });
      for (let i = 1; i <= 4; i++) spots.push({
        parkingLotId: lot._id, floorId: floor._id,
        spotNumber: `F${floor.floorNumber}-C${i}`, spotType: "COMPACT"
      });
      for (let i = 1; i <= 2; i++) spots.push({
        parkingLotId: lot._id, floorId: floor._id,
        spotNumber: `F${floor.floorNumber}-L${i}`, spotType: "LARGE"
      });
    }
    await ParkingSpot.insertMany(spots);
    await PricingRule.insertMany([
      { parkingLotId: lot._id, vehicleType: "MOTORCYCLE", hourlyRate: 20, version: 1 },
      { parkingLotId: lot._id, vehicleType: "CAR", hourlyRate: 40, version: 1 },
      { parkingLotId: lot._id, vehicleType: "BUS", hourlyRate: 80, version: 1 }
    ]);

    res.status(201).json({
      message: "Demo parking lot created.",
      parkingLotId: lot._id,
      floorsCreated: floors.length,
      spotsCreated: spots.length,
      pricing: { MOTORCYCLE: 20, CAR: 40, BUS: 80 }
    });
  } catch (error) { next(error); }
};
