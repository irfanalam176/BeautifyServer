import { Router } from "express";
import { createAppointment } from "../controller/appointmentController.js";
const appointmentRouter = Router()
appointmentRouter.post("/create-appointment",createAppointment)
export default appointmentRouter