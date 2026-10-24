const router = require("express").Router();
const controller = require("../controllers/adminController");

// Demo-only setup endpoint. Protect or remove it before public deployment.
router.post("/seed", controller.seed);

module.exports = router;
