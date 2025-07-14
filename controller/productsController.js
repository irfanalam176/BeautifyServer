import db from "../model/db.js";
import { v4 as uuidv4 } from "uuid";
import { uploadProductImage } from "../config/multerConfig.js";
import fs from 'fs';
import path from 'path';
// get products
export async function getProducts(req, res) {
    try {
        const sql = `
            SELECT 
                p.product_id,
                p.name,
                p.description,
                p.cost,
                p.price,
                p.stock_quantity,
                p.image,
                c.category_name 
            FROM products p
            LEFT JOIN categories c ON p.category = c.id
        `;
        const [response] = await db.query(sql);
        
        res.json({ list: response });
    } catch (e) {
        console.log("Cannot get products: " + e);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
// get product by id for edit

export async function getProductById(req, res) {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: "Product ID is required" });
  }

  try {
    const query = `
      SELECT 
        p.product_id AS id,
        p.name,
        p.description,
        p.cost,
        p.price,
        p.stock_quantity AS quantity,
        p.image,
        p.category,
        c.category_name 
      FROM products p 
      LEFT JOIN categories c ON p.category = c.id 
      WHERE p.product_id = ?
    `;

    const [result] = await db.query(query, [id]);

    if (result.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.status(200).json(result[0] );

  } catch (error) {
    console.error("Error fetching product by ID:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}



// add products
export async function addProduct(req, res) {
  try {
    // First handle the file upload
    uploadProductImage(req, res, async (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message,
        });
      }

      // Now req.body and req.file will be available
      console.log("Request body:", req.body);
      console.log("Uploaded file:", req.file);

      const { name, description,cost, price,quantity, category_id } = req.body;

      if (!name || !description || !cost|| !price ||!quantity || !category_id || !req.file) {
        return res.status(400).json({
          success: false,
          message: "All fields are required",
        });
      }

      try {
         const productId = uuidv4();
        const sql = `INSERT INTO products(product_id, name, category, description,cost, price, stock_quantity, image) VALUES (?,?,?,?,?,?,?,?)`;
        const [response] = await db.execute(sql,[productId,name,category_id,description,cost,price,quantity,req.file.filename])
        if(response.affectedRows>0){
            return res.json({
                status:"success",
                message:"Product Added"
            })
        }
      } catch (e) {
        console.log("could not add product" + e);
      }

      res.status(201).json({
        success: true,
        message: "Product added successfully",
        data: {
          name,
          description,
          cost,
          price,
          category_id,
          image: req.file.filename,
        },
      });
    });
  } catch (error) {
    console.error("Error in addProduct:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

// update product
export function updateProduct(req, res) {
  
    
  try {
    // First handle the file upload
    uploadProductImage(req, res, async (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message,
        });
      }
      console.log(req.body);
      console.log(req.file);
      
      const { name, description,cost, price, quantity, category_id } = req.body;
      const { id } = req.params;

      if (!name || !description ||!cost|| !price || !quantity || !category_id) {
        return res.status(400).json({
          success: false,
          message: "All fields are required",
        });
      }

      try {
        // Check if product exists
        const checkQuery = `SELECT image FROM products WHERE product_id = ?`;
        const [existingProduct] = await db.execute(checkQuery, [id]);

        if (existingProduct.length === 0) {
          return res.status(404).json({
            success: false,
            message: "Product not found",
          });
        }

        let image = existingProduct[0].image;

        // Update image if a new file is provided
        if (req.file) {
          image = req.file.filename;
        }

        const updateQuery = `
          UPDATE products 
          SET name = ?, category = ?, description = ?,cost=?, price = ?, stock_quantity = ?, image = ? 
          WHERE product_id = ?
        `;

        const [response] = await db.execute(updateQuery, [
          name,
          category_id,
          description,
          cost,
          price,
          quantity,
          image,
          id,
        ]);

        if (response.affectedRows > 0) {
          return res.json({
            status: "success",
            message: "Product updated successfully",
            data: {
              id,
              name,
              description,
              cost,
              price,
              quantity,
              category_id,
              image,
            },
          });
        } else {
          return res.status(400).json({
            success: false,
            message: "Failed to update product",
          });
        }
      } catch (e) {
        console.log("Error updating product:", e);
        return res.status(500).json({
          success: false,
          message: "Internal server error",
        });
      }
    });
  } catch (error) {
    console.error("Error in updateProduct:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

// add categories
export async function addCategories(req,res){
  const{name} = req.body
  
  const categoryId = uuidv4()
  const sql = `INSERT INTO categories(id, category_name) VALUES (?,?)`
  try{
    const[response] = await db.execute(sql,[categoryId,name])
    
    if(response.affectedRows>0){
     return res.status(201).json({ message: 'Category added successfully', id: categoryId });
    }
  }catch(e){
    console.log("Internal server error" + e);
    res.status(404)
    
  }
}
// get categories
export async function getCategories(req, res) {
  
  const sql = "SELECT * FROM categories";
  try {
    const [result] = await db.query(sql);
    console.log(result);
    
    if (result.length > 0) {
      res.json({ list: result });
    }
  } catch (e) {
    console.log("cannot get categories" + e);
  }
}

// delete product

export async function deleteProduct(req, res) {
  const id = req.params.id;

  try {
    // Step 1: Get the image filename
    const [rows] = await db.execute(`SELECT image FROM products WHERE product_id = ?`, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ status: "error", message: "Product not found" });
    }

    const imageFilename = rows[0].image;
    const imagePath = path.join('uploads', imageFilename);

    // Step 2: Delete the image file if it exists
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    // Step 3: Delete the product from the database
    const [response] = await db.execute(`DELETE FROM products WHERE product_id = ?`, [id]);

    if (response.affectedRows > 0) {
      return res.status(200).json({ status: "success", message: "Product Removed" });
    }

    return res.status(404).json({ status: "error", message: "Cannot delete product" });

  } catch (e) {
    console.error("Error deleting product:", e);
    return res.status(500).json({ status: "error", message: "Internal server error" });
  }
}


export async function deleteCategory(req,res){
      const id = req.params.id
    const sql = `DELETE FROM categories WHERE id=?`
    try{
        const[response] = await db.execute(sql,[id])
        if(response.affectedRows>0){
            res.status(200).json({status:"success",message:"Record Deleted"})
        }
    }catch(e){
        console.log("Cannot Delete Record" + e);
        res.status(404)
    }
}

export async function getCategoriesById(req,res){
  const id = req.params.id
  
  const sql = `SELECT * FROM categories WHERE id = ?`
  try{
    const[response] = await db.execute(sql,[id])
    res.status(200).json(response[0])
  }catch(e){
    console.log("Cannot get Category" + e);
    
  }
}

export async function updateCategory(req, res) {
  const id = req.params.id;
  const { name } = req.body;

  const sql = `UPDATE categories SET category_name = ? WHERE id = ?`;

  try {
    const [result] = await db.query(sql, [name, id]);

    res.status(200).json({ message: 'Category updated successfully' });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}