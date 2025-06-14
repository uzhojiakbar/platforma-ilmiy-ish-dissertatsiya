const { CustomError } = require("../../components/customError");
const { db } = require("../../db/db");
const { userFindGeneric } = require("../../db/queries");

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

module.exports = { getUserInfo };
