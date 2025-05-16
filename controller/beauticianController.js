import db from "../model/db.js"
import { v4 as uuidv4 } from "uuid";

// add beautician
export async function addBeautician(req,res){
    const {name,specialization,contact,schedule} = req.body
    try{
        const sql = `INSERT INTO beauticians(beautician_id, name, phone, specialization, availability_schedule) VALUES (?,?,?,?,?)`
        const beauticianId = uuidv4()
        const [response] = await db.execute(sql,[beauticianId,name,contact,specialization,schedule.replace(/\s+/g, "")])
        if(response.affectedRows>0){
            return res.status(200).json({status:"success",message:"Beautician added"})
        }
        return res.status(404).json({status:"error",message:"Beautician not added"})
    }catch(e){
        console.log("internal server error" + e)
        return res.status(404).json({status:"error",message:"internal server error"})
    }
}
    // Get beautician
export async function getBeauticians(req,res){
    
    const sql = `SELECT * FROM beauticians`
    try{
        const[response] = await db.query(sql)
        
        return res.json(response)

    }catch(e){
        console.log("intenal server error" + e);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

// get beautician by id
export async function getBeauticianById(req,res){
    const beauticianId = req.params.id
    const sql = `SELECT * FROM beauticians WHERE beautician_id = ?`
    try{
        const [response] = await db.execute(sql,[beauticianId])
        if(response.length>0){
            return res.status(200).json(response[0])
        }
    }catch(e){
          console.log("intenal server error" + e);
    }
}

// update beautician
export async function updateBeautician(req,res){
    const beauticianId = req.params.id
    const {name,specialization,contact,schedule} = req.body
    
        try{
        const sql = `UPDATE beauticians SET name=?,phone=?,specialization=?,availability_schedule=? WHERE beautician_id=?`
        const [response] = await db.execute(sql,[name,contact,specialization,schedule.replace(/\s+/g, ""),beauticianId])
        if(response.affectedRows>0){
            return res.status(200).json({status:"success",message:"Beautician updated"})
        }
        return res.status(404).json({status:"error",message:"Beautician not updated"})
    }catch(e){
        console.log("internal server error" + e)
        return res.status(404).json({status:"error",message:"internal server error"})
    }
}

// delete beautician
export async function deleteBeautician(req,res){
    
    const beauticianId = req.params.id
    const sql = `DELETE FROM beauticians WHERE beautician_id = ?`
    try{
        const[response] = await db.execute(sql,[beauticianId])
        if(response.affectedRows>0){
            return res.status(200).json({status:"200",message:"Beautician deleted"})
        }
        return res.status(404).json({status:"error",message:"cannot delete beautician"})
    }catch(e){
        console.log("Internal server error" + e);
        return res.status(404).json({status:"error",message:"Internal server error"})
    }
}