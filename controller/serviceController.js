import db from "../model/db.js";
import { v4 as uuidv4 } from "uuid";
import { uploadProductImage } from "../config/multerConfig.js";
import fs from 'fs';
import path from 'path';
// get service
export async function getService(req, res) {
    try {
        const sql = `SELECT * FROM services`;
        const [response] = await db.query(sql);
        
        res.json({ list: response });
    } catch (e) {
        console.log("Cannot get service: " + e);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
// add service
export async function addService(req, res) {
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

      const { name, description,cost, price } = req.body;

      if (!name || !description ||!cost || !price || !req.file) {
        return res.status(400).json({
          success: false,
          message: "All fields are required",
        });
      }

      try {
         const serviceId = uuidv4();
        const sql = `INSERT INTO services(service_id, name, image, description,cost, price) VALUES (?,?,?,?,?,?)`;
        const [response] = await db.execute(sql,[serviceId,name,req.file.filename,description,cost,price])
        if(response.affectedRows>0){
            return res.json({
                status:"success",
                message:"Service Added"
            })
        }
      } catch (e) {
        console.log("could not add Service" + e);
      }

      res.status(201).json({
        success: true,
        message: "Service added successfully",
        data: {
          name,
          description,
          cost,
          price,
          image: req.file.filename,
        },
      });
    });
  } catch (error) {
    console.error("Error in addService:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

// get service by id for edit

export async function getServiceById(req, res) {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: "Service ID is required" });
  }

  try {
    const query = `SELECT * FROM services WHERE service_id = ?`;

    const [result] = await db.query(query, [id]);

    if (result.length === 0) {
      return res.status(404).json({ message: "service not found" });
    }

    return res.status(200).json(result[0] );

  } catch (error) {
    console.error("Error fetching service by ID:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// update Service
export function updateService(req, res) {
  
    
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
      
      const { name, description,cost, price } = req.body;
      const { id } = req.params;

      if (!name || !description || !cost || !price) {
        return res.status(400).json({
          success: false,
          message: "All fields are required",
        });
      }

      try {
        // Check if service exists
        const checkQuery = `SELECT image FROM services WHERE service_id = ?`;
        const [existingService] = await db.execute(checkQuery, [id]);

        if (existingService.length === 0) {
          return res.status(404).json({
            success: false,
            message: "service not found",
          });
        }

        let image = existingService[0].image;

        // Update image if a new file is provided
        if (req.file) {
          image = req.file.filename;
        }

        const updateQuery = `
          UPDATE services SET name=?,image=?,description=?,cost=?, price=? WHERE service_id = ?
        `;

        const [response] = await db.execute(updateQuery, [
          name,
          image,
          description,
          cost,
          price,
          id,
        ]);

        if (response.affectedRows > 0) {
          return res.json({
            status: "success",
            message: "Service updated successfully",
            data: {
              id,
              name,
              description,
              cost,
              price,
              image,
            },
          });
        } else {
          return res.status(400).json({
            success: false,
            message: "Failed to update service",
          });
        }
      } catch (e) {
        console.log("Error updating service:", e);
        return res.status(500).json({
          success: false,
          message: "Internal server error",
        });
      }
    });
  } catch (error) {
    console.error("Error in updateService:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

// delete service


export async function deleteService(req, res) {
  const id = req.params.id;

  try {
    // Step 1: Get the image filename from the database
    const [rows] = await db.execute(`SELECT image FROM services WHERE service_id = ?`, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ status: "error", message: "Service not found" });
    }

    const imageFilename = rows[0].image;
    const imagePath = path.join('uploads', imageFilename);

    // Step 2: Delete the image file if it exists
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    // Step 3: Delete the service from the database
    const [response] = await db.execute(`DELETE FROM services WHERE service_id = ?`, [id]);

    if (response.affectedRows > 0) {
      return res.status(200).json({ status: "success", message: "Service Removed" });
    }

    return res.status(404).json({ status: "error", message: "Cannot delete service" });

  } catch (e) {
    console.error("Error deleting service:", e);
    return res.status(500).json({ status: "error", message: "Internal server error" });
  }
}
