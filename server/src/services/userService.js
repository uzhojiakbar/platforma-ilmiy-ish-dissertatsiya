const { generateAccessToken, generateRefreshToken } = require("../controllers/auth/tokenController");
const { db } = require("../db/db");
const { userFindByPhoneOrID, insertUser, userFindGeneric } = require("../db/queries");
const { roles } = require("../utils/roles");
const {  isValidPhone, isValidPassword } = require("../utils/valid");
const bcrypt = require("bcrypt");

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
      message: "Telefon raqam noto‘g‘ri (998XXXXXXXXX)",
    });
  }

  if (!isValidPassword(password)) {
    return callback({
      code: 400,
      message: "Parol majburiy va kamida 6 belgidan iborat bo‘lishi kerak",
    });
  }

  if (!roles.includes(role)) {
    return callback({ code: 400, message: "Rol noto‘g‘ri tanlangan" });
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

function loginUser(phone, password, user_agent, ip, callback) {
  db.get(userFindGeneric("phone", phone), (err, row) => {
    if (err) return callback({ code: 500, message: "Bazaga murojaatda xatolik" });
    if (!row) return callback({ code: 404, message: "Foydalanuvchi topilmadi" });
    bcrypt.compare(password, row.password, (err, result) => {
      if (err) return callback({ code: 500, message: "Parolni xashlashda xatolik" });
      if (!result) return callback({ code: 401, message: "Parol noto‘g‘ri" });
      generateAccessToken(row.id, row.role, (err, accessToken) => {
        if (err) return callback({ code: 500, message: "Access token yaratishda xatolik" });
        generateRefreshToken(row.id, row.role, user_agent, ip, (err, refreshToken) => {
          if (err) return callback({ code: 500, message: "Refresh token yaratishda xatolik" });
          callback(null, { accessToken, refreshToken });
        });
      });
    });
  });
}

module.exports = {
  createUser,
  loginUser,
};