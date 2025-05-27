import { Router } from "express";
import { addImage, deleteImages, getImages } from "../controller/galleryController.js";
const galleryRouter = Router()
galleryRouter.post("/add-image",addImage)
galleryRouter.get("/get-images",getImages)
galleryRouter.post("/delete-images",deleteImages)
export default galleryRouter