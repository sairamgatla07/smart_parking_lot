const router = require("express").Router();
const controller = require("../controllers/parkingController");

router.post("/entry", controller.checkIn);
router.post("/exit/:ticketId", controller.checkOut);
router.get("/availability", controller.availability);
router.get("/tickets/:ticketId", controller.getTicket);

module.exports = router;
