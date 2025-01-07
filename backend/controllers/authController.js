import UserModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcryptjs from "bcryptjs";

const register = async (req, res) => {
  try {
    const { username, role, password } = req.body;

    const existUser = await UserModel.findOne({ username });
    if (existUser) {
      return res
        .status(401)
        .json({ success: false, message: "User already Exist" });
    }
    const hashedPassword = await bcryptjs.hashSync(password, 10);
    const newUser = new UserModel({
      username,
      password: hashedPassword,
      role,
    });

    await newUser.save();

    res.status(201).json({
      message: `User registered successfully with username ${username}`,
      newUser,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
    console.log(err);
  }
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await UserModel.findOne({ username });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Invalid Credentials" });
    }

    const isPasswordValid = await bcryptjs.compare(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(404)
        .json({ success: false, message: "Invalid Password" });
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      maxAge: 3600000,
    });
    res
      .status(200)
      .json({ success: true, message: "Login Successful", user, token });
  } catch (err) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
    console.log(err);
  }
};

const logout = async (req, res) => {
  try {
    res.clearCookie("token");
    res.status(200).json({ message: "User logged out successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
    console.log(err);
  }
};

export { register, login, logout };
