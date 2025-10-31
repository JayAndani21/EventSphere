const express = require("express");
const router = express.Router();
const { getAvailableRuntimes } = require("../controllers/pistonController");
const auth = require("../middleware/authMiddleware");

router.get("/runtimes", auth, getAvailableRuntimes);

module.exports = router;
