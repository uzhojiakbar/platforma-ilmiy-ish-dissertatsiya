const { db } = require("../../db/db");
const jwt = require("jsonwebtoken");

function generateAccessToken(user_id, role, session_id, callback) {
  const token = jwt.sign({ user_id, role, session_id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
  callback(null, token);
}

function generateRefreshToken(user_id, role, user_agent, ip, session_id, callback) {
  const token = jwt.sign({ user_id, role, session_id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" });
  callback(null, token);
}

function generateNewAccessTokenWithRefreshToken(accessToken, refreshToken, callback) {
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return callback({ code: 401, message: "Refresh token noto'g'ri yoki buzilgan" });
    }

    const now = new Date();
    const expiresAt = new Date(decoded.exp * 1000);

    if (expiresAt < now) {
      return callback({ code: 401, message: "Refresh token muddati tugagan" });
    }

    const user_id = decoded.user_id;
    const role = decoded.role;
    const session_id = decoded.session_id;

    // Generate new access token with session_id
    const token = jwt.sign({ user_id, role, session_id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" });

    // Update session with new access token
    const updateSession = `
      UPDATE sessions 
      SET access_token = ?
      WHERE id = ? AND refresh_token = ?
    `;

    db.run(updateSession, [token, session_id, refreshToken], (err) => {
      if (err) {
        return callback({ code: 500, message: "Session yangilashda xatolik" });
      }
      return callback(null, { accessToken: token, refreshToken });
    });
  });
}

function DeleteOneSession(accessToken, refreshToken, callback) {
  // First verify the tokens to get session_id
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return callback({ code: 401, message: "Refresh token noto'g'ri yoki buzilgan" });
    }

    const session_id = decoded.session_id;
    
    // Delete the session
    const query = `DELETE FROM sessions WHERE id = ?`;
    db.run(query, [session_id], function (err) {
      if (err) return callback({ code: 500, message: "Session o'chirishda xatolik" });
      callback(null, { deleted: this.changes > 0 });
    });
  });
}

function DeleteAllSessions(user_id, callback) {
  const query = `DELETE FROM sessions WHERE user_id = ?`;
  db.run(query, [user_id], function (err) {
    if (err) return callback({ code: 500, message: "Sessiyalarni o'chirishda xatolik" });
    callback(null, { deleted: this.changes > 0 });
  });
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  generateNewAccessTokenWithRefreshToken,
  DeleteOneSession,
  DeleteAllSessions
};