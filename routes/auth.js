import { Router } from "express";
import { adminLogin, login, register } from "../controller/authController.js";

const authRouter = Router()
// login route
authRouter.post("/login",login)
// register route
authRouter.post("/register",register)
// admin login route
authRouter.post("/admin-login",adminLogin)

export default authRouter
