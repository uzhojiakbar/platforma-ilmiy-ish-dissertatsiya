require("dotenv").config();
const path = require("path");
const fs = require("fs");
const sqlite3 = require("sqlite3").verbose();
const { v4: uuidv4 } = require("uuid");
const { CustomError } = require("../components/customError.js");
const { userFindByUsername, insertUser } = require("./queries.js");
const { roles } = require("../utils/roles.js");

const DB_PATH = process.env.DB_PATH;

if (!DB_PATH) {
    console.error("❌ .env faylida DB_PATH aniqlanmagan!");
    process.exit(1);
}

const dir = path.dirname(DB_PATH);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
      console.error("❌ DB ulanishda xatolik:", err.message);
    } else {
      console.log("✅ SQLite DB ulanmoqda...");
      createUsersTable();
      createTokenTable();
      createAccessTokenTable();
      createSessionsTable();
      createUserNotificationsTable()
    }
});

const createUsersTable = () => {
    const createTableSQL = `
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        phone TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        role TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
    `

    db.run(createTableSQL, (err) => {
        if (err) {
          console.error("❌ Users Jadval yaratishda xatolik:", err.message);
        } else {
          console.log("✅ users jadvali tayyor");
        }
      });
}   

function createTokenTable() {
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS refresh_tokens (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    token TEXT NOT NULL,
    user_agent TEXT,
    ip TEXT,
    expires_at TEXT
  );
  `;

  db.run(createTableSQL, (err) => {
    if (err) {
      console.error(
        "❌ refresh_tokens Jadval yaratishda xatolik:",
        err.message
      );
    } else {
      console.log("✅ refresh_tokens jadvali tayyor");
    }
  });
}

function createAccessTokenTable() {
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS access_tokens (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    token TEXT NOT NULL,
    expires_at TEXT
  );
  `;

  db.run(createTableSQL, (err) => {
    if (err) {
      console.error("❌ access_tokens Jadval yaratishda xatolik:", err.message);
    } else {
      console.log("✅ access_tokens jadvali tayyor");
    }
  });
}

function createSessionsTable() {
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    user_agent TEXT,
    ip TEXT,
    access_token TEXT,
    refresh_token TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  `;

  db.run(createTableSQL, (err) => {
    if (err) {
      console.error("❌ sessions Jadval yaratishda xatolik:", err.message);
    } else {
      console.log("✅ sessions jadvali tayyor");
    }
  });
}


function createUserNotificationsTable() {
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS user_notifications (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    link TEXT,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  `;

  db.run(createTableSQL, (err) => {
    if (err) {
      console.error("❌ user_notifications Jadval yaratishda xatolik:", err.message);
    } else {
      console.log("✅ user_notifications jadvali tayyor");
    }
  });
}


module.exports = {
    db
};
