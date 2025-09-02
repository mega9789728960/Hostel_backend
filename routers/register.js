import express from "express";
import register_controller from "../controllers/register.js";
const register_router = express.Router();
register_router.use("/register",register_controller);
export default  register_router

