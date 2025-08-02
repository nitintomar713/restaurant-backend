const express = require("express");
const router = express.Router();
const { getSalesData } = require("../controllers/salesController");

router.get("/sales", getSalesData);

module.exports = router;
