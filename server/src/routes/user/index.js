const express = require("express");
const { authenticateToken } = require("../../middleware/auth");
const { getUserInfo } = require("../../controllers/user");
const router = express.Router();

router.get("/", authenticateToken, getUserInfo);
router.get("/sessions", authenticateToken, getUserInfo);


module.exports = router;
