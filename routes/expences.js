import { Router } from "express";
import { addExpences, deleteExpences, getExpences, getExpencesById, updateExpences } from "../controller/expencesController.js";

const expencesRouter = Router()
expencesRouter.post("/add-expences",addExpences)
expencesRouter.get("/get-expences",getExpences)
expencesRouter.get("/get-expences-by-id/:id",getExpencesById)
expencesRouter.delete("/delete-expences/:id",deleteExpences)
expencesRouter.put("/edit-expences/:id",updateExpences)
export default expencesRouter