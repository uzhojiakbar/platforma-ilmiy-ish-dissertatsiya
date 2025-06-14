const { db } = require("../../db/db");
const { v4: uuidv4 } = require("uuid");
const jwt = require("jsonwebtoken");


function saveRefreshToken(
  { user_id, token, user_agent, ip, expires_at },
  callback
) {
  const id = uuidv4();

  const insertSQL = `
    INSERT INTO refresh_tokens (id, user_id, token, user_agent, ip, expires_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.run(
    insertSQL,
    [id, user_id, token, user_agent, ip, expires_at],
    function (err) {
      if (err) return callback(err);
      callback(null, { id });
    }
  );
}

function findRefreshToken(token, callback) {
  const query = `SELECT * FROM refresh_tokens WHERE token = ?`;
  db.get(query, [token], (err, row) => {
    if (err) return callback(err);
    callback(null, row);
  });
}

function deleteRefreshToken(token, callback) {
  const query = `DELETE FROM refresh_tokens WHERE token = ?`;
  db.run(query, [token], function (err) {
    if (err) return callback(err);
    return callback(null, { deleted: this.changes > 0 });
  });
}

function deleteAllUserTokens(user_id, callback) {
  const query = `DELETE FROM refresh_tokens WHERE user_id = ?`;
  db.run(query, [user_id], function (err) {
    if (err) return callback(err);
    callback(null, { deleted: this.changes });
  });
}

// --- access tokenlar uchun --- //

function saveAccessToken({ user_id, token, expires_at }, callback) {
  const id = uuidv4();
  const insertSQL = `
    INSERT INTO access_tokens (id, user_id, token, expires_at)
    VALUES (?, ?, ?, ?)
  `;

  db.run(insertSQL, [id, user_id, token, expires_at], function (err) {
    if (err) return callback(err);
    callback(null, { id });
  });
}

function findAccessToken(token, callback) {
  const query = `SELECT * FROM access_tokens WHERE token = ?`;
  db.get(query, [token], (err, row) => {
    if (err) return callback(err);
    callback(null, row);
  });
}

function deleteAccessToken(token, callback) {
  const query = `DELETE FROM access_tokens WHERE token = ?`;
  db.run(query, [token], function (err) {
    if (err) return callback(err);
    callback(null, { deleted: this.changes > 0 });
  });
}


// SESSIONLAR UCHUN

function DeleteOneSession(accessToken, refreshToken, callback) {
  const query = `DELETE FROM access_tokens WHERE token = ?`;
  const query2 = `DELETE FROM refresh_tokens WHERE token = ?`;
  db.run(query, [accessToken], function (err) {
    if (err) return callback(err);
    callback(null, { deleted: this.changes > 0 });
  });
  db.run(query2, [refreshToken], function (err) {
    if (err) return callback(err);
    callback(null, { deleted: this.changes > 0 });
  });
}

function DeleteAllSessions(user_id, callback) {
  const query = `DELETE FROM access_tokens WHERE user_id = ?`;
  const query2 = `DELETE FROM refresh_tokens WHERE user_id = ?`;
  db.run(query, [user_id], function (err) {
    if (err) return callback(err);
    db.run(query2, [user_id], function (err) {
      if (err) return callback(err);
      callback(null, { deleted: true });
    });
  });
}

// --- generatorlar --- //

function generateAccessToken(user_id,role,callback) {
  const token = jwt.sign({ user_id,role }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
  saveAccessToken({ user_id, token, expires_at: Date.now() + 15 * 60 * 1000 }, (err, result) => {
    if (err) return callback(err);
    callback(null, token);
  });
  // return callback(null, token);
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
    const token = jwt.sign({ user_id, role }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" });

    // Eski tokenni o'chirish
    deleteAccessToken(accessToken, (err) => {
      if (err) {
        return callback({ code: 500, message: "Eski tokenni o'chirishda xatolik" });
      }

      // Yangi tokenni saqlash
      saveAccessToken({ user_id, token, expires_at: Date.now() + 15 * 60 * 1000 }, (err) => {
        if (err) {
          return callback({ code: 500, message: "Yangi tokenni saqlashda xatolik" });
        }

        // Faqat bir marta callback chaqiriladi
        return callback(null, { accessToken: token, refreshToken: refreshToken });
      });
    });
  });
}


function generateRefreshToken(user_id,role,user_agent,ip,callback) {
  const token = jwt.sign({ user_id,role }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" });
  saveRefreshToken({ user_id, token, user_agent, ip, expires_at: Date.now() + 7 * 24 * 60 * 60 * 1000 }, (err, result) => {
    if (err) return callback(err);
    callback(null, token);
  });
  // return callback(null, token);
}

module.exports = {
  saveRefreshToken,
  findRefreshToken,
  deleteRefreshToken,
  deleteAllUserTokens,
  saveAccessToken,
  findAccessToken,
  deleteAccessToken,
  generateAccessToken,
  generateRefreshToken,
  DeleteOneSession,
  DeleteAllSessions,
  generateNewAccessTokenWithRefreshToken
};