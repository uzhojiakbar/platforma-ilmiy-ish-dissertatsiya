const express = require("express");
const { authenticateToken, AdminOrThisUser } = require("../../middleware/auth");
const { getUserInfo, getUserSessions, GetUserSession, getUserNotifications, GetUserNewNotificationsCount, createUserNotification } = require("../../controllers/user");
const router = express.Router();

router.get("/", authenticateToken, getUserInfo);
router.get("/sessions/", authenticateToken, getUserSessions);
router.get("/session/:session_id", authenticateToken, GetUserSession);
router.get("/notifications", authenticateToken, getUserNotifications);
router.get("/notifications/count", authenticateToken, GetUserNewNotificationsCount);
router.post("/notifications", authenticateToken, AdminOrThisUser, createUserNotification);





module.exports = router;
