import db from "../model/db.js";
import { v4 as uuidv4 } from "uuid";
export async function createAppointment(req,res){
  const{serviceId,userId,date} = req.body
  const appointmentId = uuidv4()
  const sql = `INSERT INTO appointments(appointment_id, customer_id, service_id, appointment_date) VALUES (?,?,?,?)`
 
  try{
     const [response] = await db.execute(sql,[appointmentId,userId,serviceId,date])
  if(response.affectedRows>0){
    res.status(200).json({status:"success",message:"Appointment fixed"})
}
res.status(500)
  }catch(e){
    console.log("Internal server error in appointment fixing"+e);
    res.status(400)
  }
}