const express = require("express");
const { authenticateToken } = require("../../middleware/auth");
const { getUserInfo, getUserSessions, GetUserSession } = require("../../controllers/user");
const router = express.Router();

router.get("/", authenticateToken, getUserInfo);
router.get("/sessions/", authenticateToken, getUserSessions);
router.get("/session/:session_id", authenticateToken, GetUserSession);



module.exports = router;
