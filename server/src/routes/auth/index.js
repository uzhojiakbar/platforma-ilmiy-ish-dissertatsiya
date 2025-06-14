const express = require("express");
const { register, login, logout, logoutAll, refreshToken } = require("../../controllers/auth/index");
const { authenticateToken } = require("../../middleware/auth");
// const {
//   login,
//   register,
//   refreshToken,
//   logout,
// } = require("../../controllers/auth/index");
// const { authenticateToken } = require("../../middleware/auth");
// const upload = require("../../middleware/uploadAvatar");

const router = express.Router();

router.post("/login", login);
router.post("/register", register);
router.post("/refresh-token", refreshToken);
router.post("/logout", logout);
router.post("/logout-all", authenticateToken, logoutAll);

module.exports = router;