const express = require("express");
const router = express.Router();
const blockedDatesController = require("../controllers/blockedDates.controller");
const authMiddleware = require("../middlewares/authMiddleware");

router.post("/blocked-dates", authMiddleware, blockedDatesController.blockDates);

module.exports = router;
