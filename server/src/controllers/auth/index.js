// src/controllers/auth/index.js
const { createUser, loginUser } = require("../../services/userService");
const { v4: uuidv4 } = require("uuid");
const {  DeleteOneSession, DeleteAllSessions, generateRefreshToken, generateNewAccessTokenWithRefreshToken } = require("./tokenController");

const register = (req, res) => {
  const { phone, password, first_name, last_name, role } = req.body;
  const id = uuidv4();
  createUser({ id, phone, password, first_name, last_name, role: "user" }, (err, user) => {
    if (err) {
      return res.status(err?.code).json({ message: err?.message });
      // throw new CustomError(err.code, err.message);
    }
    return res.status(200).json({ message: "User created successfully" });
  });
};

const CreateUserController = (req, res) => {
  const { phone, password, first_name, last_name, role } = req.body;
  createUser({ phone, password, first_name, last_name, role }, (err, user) => {
    if (err) {
      return res.status(err.code).json({ message: err.message });
    }
    return res.status(200).json({ message: "User created successfully" });
  });
};

const login = (req, res) => {
  const { phone, password } = req.body;
  const ip = req.ip || req.connection.remoteAddress;
  const user_agent = req.headers["user-agent"];

  console.log("ip",ip);
  console.log("user_agent",user_agent);
  if(!phone || !password) {
    return res.status(400).json({ message: "Telefon raqam va parol majburiy" });
  }

  loginUser(phone, password, user_agent, ip, (err, user) => {
    if (err) {
      return res.status(err.code).json({ message: err.message });
    }
    return res.status(200).json( user || {});
  });
};

const logout = (req, res) => {
  const { accessToken,refreshToken } = req.body;
  DeleteOneSession(accessToken, refreshToken, (err, result) => {
    if (err) return res.status(err.code).json({ message: err.message });
    return res.status(200).json({ message: "Foydalanuvchi tizimdan chiqdi" });
  });
};

const logoutAll = (req, res) => {
  const { id: user_id } = req.userInfo;
  const { refreshToken } = req.body;

  console.log("user_id",user_id);
  console.log("req.userInfo",req.userInfo);
  
  DeleteAllSessions(user_id, refreshToken, (err, result) => {
    if (err) return res.status(err.code).json({ message: err.message });
    return res.status(200).json({ message: "Foydalanuvchining barcha sessiyasi o'chirildi" });
  });
};

const refreshToken = (req, res) => {
  const { accessToken,refreshToken } = req.body;
  generateNewAccessTokenWithRefreshToken("123",refreshToken, (err, result) => {
    if (err) return res.status(err.code).json({ message: err.message });
    return res.status(200).json(result);
  });
};


module.exports = { register,CreateUserController,login,logout,logoutAll,refreshToken };