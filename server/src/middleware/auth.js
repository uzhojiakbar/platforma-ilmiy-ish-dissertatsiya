// 📁 src/middleware/authenticateToken.js
const jwt = require("jsonwebtoken");
const { db } = require("../db/db");

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  const current_user_agent = req.headers["user-agent"];
  const current_ip = req.ip || req.connection.remoteAddress;

  console.log("current_user_agent", current_user_agent);
  console.log("current_ip", current_ip);
  console.log("token", token);
  console.log("authHeader", authHeader);

  if (!token) {
    return res.status(401).json({ error: "Token talab qilinadi" });
  }

  if (!current_user_agent) {
    return res.status(401).json({ error: "User-Agent talab qilinadi" });
  }

  // Verify token and get session_id
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: "Token noto'g'ri yoki buzilgan" });
    }

    // Check if session exists and token matches
    const checkSessionQuery = `
      SELECT s.*, u.id, u.phone, u.first_name, u.last_name, u.role, u.created_at, u.updated_at
      FROM sessions s
      JOIN users u ON s.user_id = u.id
      WHERE s.id = ? 
      AND s.access_token = ?
    `;

    db.get(checkSessionQuery, [decoded.session_id, token], (err, session) => {
      if (err) {
        return res.status(500).json({ error: "Tokenni tekshirishda xatolik" });
      }

      if (!session) {
        return res.status(401).json({ 
          error: "Session topilmadi yoki token noto'g'ri. Iltimos, qayta login qiling." 
        });
      }

      // Check if current request's user_agent and IP match the session's stored values
      if (session.user_agent !== current_user_agent || session.ip !== current_ip) {
        return res.status(401).json({ 
          error: "Sessiya boshqa qurilmadan yaratilgan. Iltimos, qayta login qiling." 
        });
      }

      // Check token expiration
      const now = new Date();
      const expiresAt = new Date(decoded.exp * 1000);

      if (expiresAt < now) {
        return res.status(401).json({
          error: "Token muddati tugagan. Iltimos, qayta login qiling.",
        });
      }

      // Set user info from session
      req.user = decoded;
      req.token = token;
      req.userInfo = {
        id: session.id,
        phone: session.phone,
        first_name: session.first_name,
        last_name: session.last_name,
        role: session.role,
        created_at: session.created_at,
        updated_at: session.updated_at
      };
      
      next();
    });
  });
}

// function authorizeAdmin(req, res, next) {
//   if (req.userInfo?.role !== "admin") {
//     return res.status(403).json({ error: "Faqat adminlar ruxsat oladi" });
//   }
//   next();
// }

module.exports = {
  authenticateToken,
//   authorizeAdmin,
};