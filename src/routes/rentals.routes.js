const express = require("express");
const { createRental } = require("../controllers/rentals.controller");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware, createRental);

module.exports = router;
