const { CustomError } = require("../../components/customError");
const { db } = require("../../db/db");
const { userFindGeneric, userSessionsGeneric, userNotificationsGeneric, createUserNotificationQuery } = require("../../db/queries");
const { v4: uuidv4 } = require('uuid');

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

      return res.status(200).json({
        ...session,
        access_token: null,
        refresh_token: null
      } || {});
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

function getUserNotifications(req, res) {
  try {
    const { id: user_id } = req.userInfo;
    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: "User ID is required"
      });
    }

    db.all(userNotificationsGeneric("user_id", user_id), (err, notifications) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Internal server error"
        });
      }

      if (notifications && notifications.length > 0) {
        const notificationIds = notifications.map(n => n.id);
        const placeholders = notificationIds.map(() => '?').join(',');
        const updateQuery = `UPDATE user_notifications SET is_read = 1 WHERE id IN (${placeholders})`;

        db.run(updateQuery, notificationIds, (updateErr) => {
          if (updateErr) {
            return res.status(500).json({
              success: false,
              message: "Internal server error"
            });
          }
          return res.status(200).json(notifications);
        });
      } else {
        return res.status(200).json([]);
      }
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

function GetUserNewNotificationsCount(req, res) {
  try {
    const { id: user_id } = req.userInfo;
    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: "User ID is required"
      });
    }

    db.all(userNotificationsGeneric("user_id", user_id), (err, notifications) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Internal server error"
        });
      }

      const newNotificationsCount = notifications?.filter(n => !n?.is_read)?.length;
      console.log(newNotificationsCount);
      return res.status(200).json({
        success: true,
        message: "New notifications count",
        count: newNotificationsCount
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

function createUserNotification(req, res) {
  try {
    const { id: user_id } = req.userInfo;
    const { user_id: user_id_to_send } = req.body;
    if (!user_id_to_send || user_id_to_send !== user_id) {
      return res.status(400).json({
        success: false,
        message: "User ID is required"
      });
    }

    const { title, message, link } = req.body;
    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: "Title and message are required"
      });
    }

    const id = uuidv4();

    db.run(createUserNotificationQuery(id,user_id, title, message, link), (err) => {
      if (err) {
        console.log(err);
        
        return res.status(500).json({
          success: false,
          message: "Internal server error"
        });
      }

      return res.status(200).json({
        success: true,
        message: "Notification created successfully",
      });
    });
  } catch (error) {
    if (error instanceof CustomError) {
      res.status(error.code).json({
        success: false,
        message: error.message
      });
    } else {
      console.log(error);
      
      res.status(500).json({
        success: false,
        message: "Internal server error"
      });
    }
  }
}

module.exports = { getUserInfo, getUserSessions,GetUserSession, getUserNotifications, GetUserNewNotificationsCount, createUserNotification };
