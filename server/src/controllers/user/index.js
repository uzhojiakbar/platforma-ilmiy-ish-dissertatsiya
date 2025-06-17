const { CustomError } = require("../../components/customError");
const { db } = require("../../db/db");
const { userFindGeneric, userSessionsGeneric } = require("../../db/queries");

function getUserInfo(req, res) {
  try {
    const { id: user_id } = req.userInfo;
    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: "User ID is required"
      });
    }

    db.get(userFindGeneric("id", user_id), (err, user) => {
      if (err) {
        console.log("err",err,user_id);
        
        return res.status(500).json({
          success: false,
          message: "Internal server error"
        });
      }
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found"
        });
      }
      res.status(200).json({
        ...user,
        password: undefined
      });
    });

  } catch (error) {
    if (error instanceof CustomError) {
      res.status(error.code).json({
        success: false,
        message: error.message
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Internal server error"
      });
    }
  }
}

function getUserSessions(req, res) {
  try {
    const { id: user_id } = req.userInfo;
    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: "User ID is required"
      });
    }

    db.all(userSessionsGeneric("user_id", user_id), (err, sessions) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Internal server error"
        });
      }

      const sessionsData = sessions?.map((session) => {
        return {
          session_id: session?.id,
          user_id: session?.user_id,
          user_agent: session?.user_agent
        }
      })

      res.status(200).json(sessionsData || {});
    });
  } catch (error) {
    if (error instanceof CustomError) {
      res.status(error.code).json({
        success: false,
        message: error.message
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Internal server error"
      });
    }
  }
}

function GetUserSession(req, res) {
  try {
    const { id: user_id } = req.userInfo;
    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: "User ID is required"
      });
    }

    const { session_id } = req.params;
    if (!session_id) {
      return res.status(400).json({
        success: false,
        message: "Session ID is required"
      });
    }

    db.get(userSessionsGeneric("id", session_id), (err, session) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Internal server error"
        });
      }
      if (session?.user_id !== user_id) {
        return res.status(403).json({
          success: false,
          message: "You are not authorized to access this session"
        });
      }

      return res.status(200).json(session || {});
    });
  } catch (error) {
    if (error instanceof CustomError) {
      res.status(error.code).json({
        success: false,
        message: error.message
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Internal server error"
      });
    }
  }
}

module.exports = { getUserInfo, getUserSessions,GetUserSession };
