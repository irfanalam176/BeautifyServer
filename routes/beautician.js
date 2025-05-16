import { Router } from "express";
import { addBeautician, deleteBeautician, getBeauticianById, getBeauticians, updateBeautician } from "../controller/beauticianController.js";
const BeauticianRouter = Router()
BeauticianRouter.post("/add-beautician",addBeautician)
BeauticianRouter.get("/get-beauticians",getBeauticians)
BeauticianRouter.get("/get-beautician-by-id/:id",getBeauticianById)
BeauticianRouter.put("/update-beautician/:id",updateBeautician)
BeauticianRouter.delete("/delete-beautician/:id",deleteBeautician)

export default BeauticianRouter