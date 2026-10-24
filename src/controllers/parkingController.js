const parkingService = require("../services/ParkingService");

exports.checkIn = async (req, res, next) => {
  try {
    const result = await parkingService.checkIn(req.body);
    res.status(201).json({
      message: "Vehicle checked in successfully.",
      ticket: result.ticket,
      vehicle: result.vehicle,
      spot: result.spot,
      pricing: { hourlyRate: result.pricing.hourlyRate, currency: result.pricing.currency }
    });
  } catch (error) { next(error); }
};

exports.checkOut = async (req, res, next) => {
  try {
    const result = await parkingService.checkOut(req.params.ticketId);
    res.json({
      message: "Vehicle checked out successfully.",
      ticket: result.ticket,
      vehicle: result.vehicle,
      spot: result.spot,
      charge: { ...result.charge, currency: result.currency }
    });
  } catch (error) { next(error); }
};

exports.availability = async (req, res, next) => {
  try {
    const data = await parkingService.getAvailability(req.query.parkingLotId);
    res.json({ parkingLotId: req.query.parkingLotId, availability: data });
  } catch (error) { next(error); }
};

exports.getTicket = async (req, res, next) => {
  try { res.json({ ticket: await parkingService.getTicket(req.params.ticketId) }); }
  catch (error) { next(error); }
};
