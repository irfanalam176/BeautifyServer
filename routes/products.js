import { Router } from "express";
import { addProduct, deleteProduct, getCategories, getProductById, getProducts, updateProduct } from "../controller/productsController.js";

const productsRouter = Router()
// get categories
productsRouter.get("/get-categories",getCategories)
// add products
productsRouter.post("/add-products",addProduct)
// get products
productsRouter.get("/get-products",getProducts)
productsRouter.get("/get-product-by-id/:id",getProductById)
// update products
productsRouter.put("/update-product/:id",updateProduct)
// delete product
productsRouter.delete("/delete-product/:id",deleteProduct)

export default productsRouter