const { generateAccessToken, generateRefreshToken } = require("../controllers/auth/tokenController");
const { db } = require("../db/db");
const { userFindByPhoneOrID, insertUser, userFindGeneric } = require("../db/queries");
const { roles } = require("../utils/roles");
const {  isValidPhone, isValidPassword } = require("../utils/valid");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require('uuid');

const DEFAULT_AVATAR = "../uploads/avatars/default.png";

function createUser(user, callback) {
  const {
    id,
    phone,
    first_name = "",
    last_name = "",
    role = "user",
    password,
  } = user;

  // --- Validatsiya ---
  if (!isValidPhone(phone)) {
    return callback({
      code: 400,
      message: "Telefon raqam noto'g'ri (998XXXXXXXXX)",
    });
  }

  if (!isValidPassword(password)) {
    return callback({
      code: 400,
      message: "Parol majburiy va kamida 6 belgidan iborat bo'lishi kerak",
    });
  }

  if (!roles.includes(role)) {
    return callback({ code: 400, message: "Rol noto'g'ri tanlangan" });
  }

  db.get(userFindGeneric("phone", phone), (err, row) => {
    if (err)
      return callback({ code: 500, message: "Bazaga murojaatda xatolik" });

    if (row) {
      return callback({
        code: 409,
        message: "Bu telefon raqam allaqachon mavjud",
      });
    }

    // --- PAROLNI HASH QILAMIZ VA USERNI YARATAMIZ ---
    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err)
        return callback({
          code: 500,
          message: "Parolni xashlashda xatolik",
        });

      db.run(
        insertUser,
        [
          id,
          phone,
          hashedPassword,
          first_name,
          last_name,
          role,
        ],
        function (err) {
          if (err)
            return callback({
              code: 500,
              message: "Foydalanuvchini saqlashda xatolik",
            });
          callback(null, { id });
        }
      );
    });
  });
}

function createSession(user_id, user_agent, ip,access_token, refresh_token, callback) {
  const session = {
    id: uuidv4(),
    user_id,
    user_agent,
    ip,
    access_token,
    refresh_token,
  };

  const insertSession = `
    INSERT INTO sessions (id, user_id, user_agent, ip, access_token, refresh_token)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.run(insertSession, [session.id, session.user_id, session.user_agent, session.ip, session.access_token, session.refresh_token], (err) => {
    console.log("err", err);
    // err [Error: SQLITE_RANGE: column index out of range] {
    
    if (err) return callback({ code: 500, message: "Session yaratishda xatolik" });
    console.log("SESSION YARATILDI", session);
    
    callback(null, session);
  });
}

function loginUser(phone, password, user_agent, ip, callback) {
  db.get(userFindGeneric("phone", phone), (err, row) => {
    if (err) return callback({ code: 500, message: "Bazaga murojaatda xatolik" });
    if (!row) return callback({ code: 404, message: "Foydalanuvchi topilmadi" });
    bcrypt.compare(password, row.password, (err, result) => {
      if (err) return callback({ code: 500, message: "Parolni xashlashda xatolik" });
      if (!result) return callback({ code: 401, message: "Parol noto'g'ri" });
      
      // First create an empty session
      const session = {
        id: uuidv4(),
        user_id: row.id,
        user_agent,
        ip,
        access_token: null,
        refresh_token: null
      };

      const insertSession = `
        INSERT INTO sessions (id, user_id, user_agent, ip, access_token, refresh_token)
        VALUES (?, ?, ?, ?, ?, ?)
      `;

      db.run(insertSession, [session.id, session.user_id, session.user_agent, session.ip, session.access_token, session.refresh_token], (err) => {
        if (err) return callback({ code: 500, message: "Session yaratishda xatolik" });

        // Generate tokens with session_id
        generateAccessToken(row.id, row.role, session.id, (err, accessToken) => {
          if (err) return callback({ code: 500, message: "Access token yaratishda xatolik" });
          generateRefreshToken(row.id, row.role, user_agent, ip, session.id, (err, refreshToken) => {
            if (err) return callback({ code: 500, message: "Refresh token yaratishda xatolik" });

            // Update session with tokens
            const updateSession = `
              UPDATE sessions 
              SET access_token = ?, refresh_token = ?
              WHERE id = ?
            `;

            db.run(updateSession, [accessToken, refreshToken, session.id], (err) => {
              if (err) return callback({ code: 500, message: "Session yangilashda xatolik" });
              callback(null, { accessToken, refreshToken, session: { ...session, access_token: accessToken, refresh_token: refreshToken } });
            });
          });
        });
      });
    });
  });
}

module.exports = {
  createUser,
  loginUser,
  createSession
};