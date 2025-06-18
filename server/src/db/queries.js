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
const userFindGeneric = (key, value) => {
  return `SELECT id, first_name, last_name,password, phone, role, created_at, updated_at FROM users WHERE ${key} = '${value}'`;
}
const userSessionsGeneric = (key, value) => {
  return `SELECT * FROM sessions WHERE ${key} = '${value}'`;
}
const userNotificationsGeneric = (key, value) => {
  return `SELECT * FROM user_notifications WHERE ${key} = '${value}'`;
}


function createUserNotificationQuery(id,user_id, title, message, link) {
  return `INSERT INTO user_notifications (id, user_id, title, message, link) VALUES ('${id}', '${user_id}', '${title}', '${message}', '${link}')`;
}


module.exports = {
  userFindByPhoneOrID,
  userFindGeneric,
  insertUser,
  userFindByPhone,
  userSessionsGeneric,
  userNotificationsGeneric,
  createUserNotificationQuery,
};