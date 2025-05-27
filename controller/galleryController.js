import db from "../model/db.js";
import { v4 as uuidv4 } from "uuid";
import { uploadProductImage } from "../config/multerConfig.js";
import fs from "fs"
import path from "path";
export async function addImage(req,res){
    console.log("Hello");
    
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


      if ( !req.file) {
        return res.status(400).json({
          success: false,
          message: "All fields are required",
        });
      }

      try {
         const imageId = uuidv4();
        const sql = `INSERT INTO gallery(image_id, image) VALUES (?,?)`;
        const [response] = await db.execute(sql,[imageId,req.file.filename])
        if(response.affectedRows>0){
            return res.json({
                status:"success",
                message:"Image Added"
            })
        }
      } catch (e) {
        console.log("could not add Image" + e);
      }

      res.status(201).json({
        success: true,
        message: "Image added successfully",
        data: {
          image: req.file.filename,
        },
      });
    });
  } catch (error) {
    console.error("Error in Image adding:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
  
}

export async function getImages(req,res){
    
    const sql = `SELECT * FROM gallery`
    try{
        const[response] = await db.query(sql)
        res.status(200).json(response)
    }catch(e){
        console.log("cannot get images" + e);
        res.status(404)
    }
    
}


export async function deleteImages(req, res) {
  const { image_ids } = req.body;

  if (!Array.isArray(image_ids) || image_ids.length === 0) {
    return res.status(400).json({ message: 'No image IDs provided' });
  }

  try {
    // 1. Get image filenames from DB
    const placeholders = image_ids.map(() => '?').join(',');
    const [rows] = await db.query(
      `SELECT image FROM gallery WHERE image_id IN (${placeholders})`,
      image_ids
    );

    // 2. Delete image files from uploads directory
    for (const row of rows) {
      const filePath = path.join('uploads', row.image);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // 3. Delete records from DB
    await db.query(
      `DELETE FROM gallery WHERE image_id IN (${placeholders})`,
      image_ids
    );

    res.status(200).json({ message: 'Images deleted successfully' });
  } catch (error) {
    console.error('Error deleting images:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
