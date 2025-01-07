import UserModel from "../models/userModel.js";

const getUser = async (requestAnimationFrame, res) => {
  try {
    const users = await UserModel.find();
    res.status(200).json({ users });
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
    console.log(err);
  }
};

const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    const checkAdmin = await UserModel.findById(userId);

    if (checkAdmin.role == "admin") {
      return res.status(409).json({ message: "You can't delete admin users" });
    }

    const user = await UserModel.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({ message: "User Not Found" });
    }
    res.status(200).json({ message: "User deleted successfully", user });
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
    console.log(err);
  }
};
export { getUser, deleteUser };
