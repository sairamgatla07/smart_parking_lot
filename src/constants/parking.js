const VEHICLE_TYPES = ["MOTORCYCLE", "CAR", "BUS"];
const SPOT_TYPES = ["MOTORCYCLE", "COMPACT", "LARGE"];
const SPOT_STATUS = ["AVAILABLE", "OCCUPIED", "OUT_OF_SERVICE"];
const TICKET_STATUS = ["ACTIVE", "COMPLETED"];

const COMPATIBLE_SPOTS = {
  MOTORCYCLE: ["MOTORCYCLE", "COMPACT", "LARGE"],
  CAR: ["COMPACT", "LARGE"],
  BUS: ["LARGE"]
};

// Lower number means a smaller spot. Choose the smallest compatible spot first.
const SPOT_RANK = { MOTORCYCLE: 1, COMPACT: 2, LARGE: 3 };

module.exports = { VEHICLE_TYPES, SPOT_TYPES, SPOT_STATUS, TICKET_STATUS, COMPATIBLE_SPOTS, SPOT_RANK };
