import { Router } from "express";
import { appointmentStatus, createAppointment, deleteAppointment, getAppointmentById, GetAppointments, getTotalAppointmentsToday, reshedule } from "../controller/appointmentController.js";
const appointmentRouter = Router()
appointmentRouter.post("/create-appointment",createAppointment)
appointmentRouter.get("/get-appointment",GetAppointments)
appointmentRouter.get("/get-total-appointments-today",getTotalAppointmentsToday)
appointmentRouter.put("/edit-appointment/:id",appointmentStatus)
appointmentRouter.get("/get-appointments-by-id/:id",getAppointmentById)
appointmentRouter.delete("/delete-appointment/:id",deleteAppointment)
appointmentRouter.put("/reshedule/:id",reshedule)
export default appointmentRouter