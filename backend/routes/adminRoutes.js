import express from "express";
import { getUser, deleteUser } from "../controllers/adminController.js";
import { isAdmin } from "../middleware/verifyToken.js";

const AdminRoutes = express.Router();
AdminRoutes.get("/getuser", isAdmin, getUser);
AdminRoutes.post("/delete/:id", isAdmin, deleteUser);

export default AdminRoutes;
