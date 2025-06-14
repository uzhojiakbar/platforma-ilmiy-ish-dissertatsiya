const { db } = require("../db/db");
const { userFindByPhoneOrID, insertUser } = require("../db/queries");
const { roles } = require("../utils/roles");
const { isValidUserID, isValidPhone } = require("../utils/valid");
const bcrypt = require("bcrypt");

const DEFAULT_AVATAR = "../uploads/avatars/default.png";

function createUser(user, callback) {
  const {
    id,
    phone,
    email = null,
    firstname = "",
    lastname = "",
    group = "",
    role = "student",
    password,
    avatar = DEFAULT_AVATAR,
  } = user;

  // --- Validatsiya ---
  if (!isValidUserID(id)) {
    return callback({
      code: 400,
      message: "ID noto‘g‘ri formatda (AB1234567)",
    });
  }

  if (!isValidPhone(phone)) {
    return callback({
      code: 400,
      message: "Telefon raqam noto‘g‘ri (998XXXXXXXXX)",
    });
  }

  if (!roles.includes(role)) {
    return callback({ code: 400, message: "Rol noto‘g‘ri tanlangan" });
  }

  if (!password || password.length < 6) {
    return callback({
      code: 400,
      message: "Parol majburiy va kamida 6 belgidan iborat bo‘lishi kerak",
    });
  }

  db.get(userFindByPhoneOrID, [id, phone], (err, row) => {
    if (err)
      return callback({ code: 500, message: "Bazaga murojaatda xatolik" });

    if (row) {
      return callback({
        code: 409,
        message: "Bu ID yoki telefon raqam allaqachon mavjud",
      });
    }

    // --- PAROLNI HASH QILAMIZ ---
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
          email,
          hashedPassword,
          firstname,
          lastname,
          group,
          "student",
          avatar,
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

module.exports = {
  createUser,
};