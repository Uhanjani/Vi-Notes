const express = require("express");
const { createSession } = require("../controllers/sessionController");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

router.post("/session", authMiddleware, createSession);

module.exports = router;
