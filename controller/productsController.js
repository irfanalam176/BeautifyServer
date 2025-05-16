import db from "../model/db.js";
import { v4 as uuidv4 } from "uuid";
import { uploadProductImage } from "../config/multerConfig.js";

// get products
export async function getProducts(req, res) {
    try {
        const sql = `
            SELECT 
                p.product_id,
                p.name,
                p.description,
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

      const { name, description, price,quantity, category_id } = req.body;

      if (!name || !description || !price ||!quantity || !category_id || !req.file) {
        return res.status(400).json({
          success: false,
          message: "All fields are required",
        });
      }

      try {
         const productId = uuidv4();
        const sql = `INSERT INTO products(product_id, name, category, description, price, stock_quantity, image) VALUES (?,?,?,?,?,?,?)`;
        const [response] = await db.execute(sql,[productId,name,category_id,description,price,quantity,req.file.filename])
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
      
      const { name, description, price, quantity, category_id } = req.body;
      const { id } = req.params;

      if (!name || !description || !price || !quantity || !category_id) {
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
          SET name = ?, category = ?, description = ?, price = ?, stock_quantity = ?, image = ? 
          WHERE product_id = ?
        `;

        const [response] = await db.execute(updateQuery, [
          name,
          category_id,
          description,
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


// get categories
export async function getCategories(req, res) {
  const sql = "SELECT * FROM categories";
  try {
    const [result] = await db.query(sql);
    if (result.length > 0) {
      res.json({ list: result });
    }
  } catch (e) {
    console.log("cannot get categories" + e);
  }
}

// delete product
export async function deleteProduct(req,res){
  const id = req.params.id
    const sql = `DELETE FROM products WHERE product_id = ?`
    try{
      const[response] = await db.execute(sql,[id])
      if(response.affectedRows>0){
        return res.status(200).json({status:"success",message:"Product Removed"})
      }
      return res.status(404).json({status:"error",message:"cannot delete product"})
    }catch(e){
      return res.json({status:"error",message:"internal server error"})
    }
}