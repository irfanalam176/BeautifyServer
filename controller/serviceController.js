import db from "../model/db.js";
import { v4 as uuidv4 } from "uuid";
import { uploadProductImage } from "../config/multerConfig.js";
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

      const { name, description, price } = req.body;

      if (!name || !description || !price || !req.file) {
        return res.status(400).json({
          success: false,
          message: "All fields are required",
        });
      }

      try {
         const serviceId = uuidv4();
        const sql = `INSERT INTO services(service_id, name, image, description, price) VALUES (?,?,?,?,?)`;
        const [response] = await db.execute(sql,[serviceId,name,req.file.filename,description,price])
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
      
      const { name, description, price } = req.body;
      const { id } = req.params;

      if (!name || !description || !price) {
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
          UPDATE services SET name=?,image=?,description=?,price=? WHERE service_id = ?
        `;

        const [response] = await db.execute(updateQuery, [
          name,
          image,
          description,
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
export async function deleteService(req,res){
  const id = req.params.id
    const sql = `DELETE FROM services WHERE service_id = ?`
    try{
      const[response] = await db.execute(sql,[id])
      if(response.affectedRows>0){
        return res.status(200).json({status:"success",message:"Service Removed"})
      }
      return res.status(404).json({status:"error",message:"cannot delete service"})
    }catch(e){
      return res.json({status:"error",message:"internal server error"})
    }
}