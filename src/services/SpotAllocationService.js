const ParkingSpot = require("../models/ParkingSpot");
const { COMPATIBLE_SPOTS, SPOT_RANK } = require("../constants/parking");

class SpotAllocationService {
  async findAndReserveSpot({ parkingLotId, vehicleType, ticketId, session }) {
    const compatibleTypes = COMPATIBLE_SPOTS[vehicleType];
    if (!compatibleTypes) {
      const error = new Error("Unsupported vehicle type.");
      error.status = 400;
      throw error;
    }

    // Try the smallest compatible spot first. Each claim is an atomic compare-and-set.
    const orderedTypes = [...compatibleTypes].sort((a, b) => SPOT_RANK[a] - SPOT_RANK[b]);
    for (const spotType of orderedTypes) {
      const spot = await ParkingSpot.findOneAndUpdate(
        { parkingLotId, spotType, status: "AVAILABLE" },
        { $set: { status: "OCCUPIED", currentTicketId: ticketId } },
        { new: true, session, sort: { floorId: 1, spotNumber: 1 } }
      );
      if (spot) return spot;
    }

    const error = new Error("No compatible parking spot is available.");
    error.status = 409;
    throw error;
  }
}

module.exports = new SpotAllocationService();
