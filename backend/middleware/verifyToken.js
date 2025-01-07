import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";
import UserModel from "../models/userModel.js";

const isAdmin = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await UserModel.findById(decoded.userId);
    console.log(user);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    if (user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Unauthorized: User is not an admin" });
    }
    req.user = user;
    next();
  } catch (err) {
    console.log(err);
  }
};

export { isAdmin };
