import { Router } from "express";
import { addService, deleteService, getService, getServiceById, updateService } from "../controller/serviceController.js";
const servicesRouter = Router()

servicesRouter.post("/add-service",addService)
servicesRouter.get("/get-services",getService)
servicesRouter.get("/get-service-by-id/:id",getServiceById)
servicesRouter.put("/update-service/:id",updateService)
servicesRouter.delete("/delete-service/:id",deleteService)

export default servicesRouter