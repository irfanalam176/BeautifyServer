import { Router } from "express";
import { addSale, dailyProfitLoss, getItems, monthlyProfitLoss } from "../controller/saleController.js";
const saleRouter = Router()

saleRouter.get("/get-items",getItems)
saleRouter.post("/add-sale",addSale)
saleRouter.get("/get-dailyProfitLoss",dailyProfitLoss)
saleRouter.get("/get-monthlyProfitLoss",monthlyProfitLoss)

export default saleRouter