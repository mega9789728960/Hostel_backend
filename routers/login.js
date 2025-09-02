import express from "express";
import login_controller from "../controllers/login.js";
const  login_router = express.Router();
login_router.use("/login",login_controller);
export default login_router;