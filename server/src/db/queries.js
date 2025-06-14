const userFindByPhone = `SELECT id FROM users WHERE phone = ?`;
const userFindByPhoneForLogin = `SELECT id, password FROM users WHERE phone = ?`;

// id TEXT PRIMARY KEY,
// first_name TEXT NOT NULL,
// last_name TEXT NOT NULL,
// phone TEXT NOT NULL UNIQUE,
// password TEXT NOT NULL,
// role TEXT NOT NULL,
// created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
// updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
const insertUser = `
    INSERT INTO users (
      id, phone, password, first_name, last_name, role
    ) VALUES (?, ?, ?, ?, ?, ?)
  `;
const userFindByPhoneOrID = `SELECT * FROM users WHERE id = ? OR phone = ?`;

module.exports = {
  userFindByPhoneOrID,
  userFindByUsername,
  insertUser,
  userFindByPhone,
};