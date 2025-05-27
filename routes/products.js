import { Router } from "express";
import { addCategories, addProduct, deleteCategory, deleteProduct, getCategories, getCategoriesById, getProductById, getProducts, updateCategory, updateProduct } from "../controller/productsController.js";

const productsRouter = Router()
// add categories
productsRouter.post("/add-categories",addCategories)
// get categories
productsRouter.get("/get-categories",getCategories)
// add products
productsRouter.post("/add-products",addProduct)
// get products
productsRouter.get("/get-products",getProducts)
// get product by id
productsRouter.get("/get-product-by-id/:id",getProductById)
// update products
productsRouter.put("/update-product/:id",updateProduct)
// delete product
productsRouter.delete("/delete-product/:id",deleteProduct)
// delete categories
productsRouter.delete("/delete-category/:id",deleteCategory)
// get categories by id
productsRouter.get("/get-categories-by-id/:id",getCategoriesById)
// update categories 
productsRouter.put("/update-categories/:id",updateCategory)

export default productsRouter