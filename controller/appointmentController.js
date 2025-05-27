import db from "../model/db.js";
import { v4 as uuidv4 } from "uuid";
export async function createAppointment(req, res) {
  const { serviceId, userId, date } = req.body;
  const appointmentId = uuidv4();
  const sql = `INSERT INTO appointments(appointment_id, customer_id, service_id, appointment_date) VALUES (?,?,?,?)`;

  try {
    const [response] = await db.execute(sql, [
      appointmentId,
      userId,
      serviceId,
      date,
    ]);
    if (response.affectedRows > 0) {
      res.status(200).json({ status: "success", message: "Appointment fixed" });
    }
    res.status(500);
  } catch (e) {
    console.log("Internal server error in appointment fixing" + e);
    res.status(400);
  }
}

// appointment admin side
export async function GetAppointments(req, res) {
  const sql = `SELECT 
    a.appointment_id,
    a.appointment_date,
    a.resheduled,
    a.status,
    c.name AS customer_name,
    c.customer_id,
    c.email,
    c.phone,
    s.name AS service_name,
    s.price
FROM appointments a
INNER JOIN customers c ON a.customer_id = c.customer_id
INNER JOIN services s ON a.service_id = s.service_id;
`;
  try {
    const [response] = await db.query(sql);
    res.status(200).json(response);
  } catch (e) {
    console.log("cannot get appointments" + e);
    res.status(404).json({ message: "Internal server error" });
  }
}

export async function appointmentStatus(req, res) {
  const { actionName } = req.body;
  const appointmentId = req.params.id;

  const sql = `UPDATE appointments SET status = ? WHERE appointment_id = ?`;

  try {
    const [response] = await db.execute(sql, [actionName, appointmentId]);

    if (response.affectedRows === 0) {
      return res
        .status(404)
        .json({ status: "error", message: "Appointment not found" });
    }

    res
      .status(200)
      .json({
        status: "success",
        message: "Appointment status updated successfully",
      });
  } catch (error) {
    console.error("Error updating appointment status:", error);
    res.status(500).json({ status: "error", message: "Server error" });
  }
}

export async function getTotalAppointmentsToday(req, res) {
  const sql = `
    SELECT COUNT(*) AS total_appointments_today
    FROM appointments
    WHERE DATE(appointment_date) = CURDATE();
  `;

  try {
    const [rows] = await db.query(sql);
    res.status(200).json({ total: rows[0].total_appointments_today });
  } catch (error) {
    console.error("Error fetching today's appointments:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

export async function getAppointmentById(req, res) {
  const id = req.params.id;

  const sql = `
SELECT 
  a.appointment_id,
  a.customer_id,
  a.service_id,
  a.appointment_date,
  a.status,
  a.created_at,
  s.name AS service_name,
  s.image AS service_image,
  s.description AS service_description,
  s.price AS service_price
FROM appointments a
LEFT JOIN services s ON a.service_id = s.service_id
WHERE a.customer_id = ?
ORDER BY a.created_at DESC;

  `;

  try {
    const [rows] = await db.execute(sql, [id]);

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ status: "error", message: "Appointment not found" });
    }

    return res.status(200).json({ status: "success", data: rows });
  } catch (e) {
    console.error("DB error:", e);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error" });
  }
}

export async function deleteAppointment(req, res) {
  const { id } = req.params;
  const sql = `DELETE FROM appointments WHERE appointment_id = ?`;
  try {
    const [response] = await db.execute(sql, [id]);
    if (response.affectedRows > 0) {
      res
        .status(200)
        .json({ status: "success", message: "Appointment Canceled" });
    }
  } catch (e) {
    console.log("Internal server error" + e);
    res
      .status(404)
      .json({ status: "error", message: "Cannot Canceled Appointment" });
  }
}

export async function reshedule(req, res) {
  const { id } = req.params;
  const { date } = req.body;

  const sql = `UPDATE appointments SET appointment_date=?,resheduled=? WHERE appointment_id=?`;
  try {
    const [response] = await db.execute(sql, [date, true, id]);
    if (response.affectedRows > 0) {
      res
        .status(200)
        .json({ status: "success", message: "Resheduled successfully" });
    }
  } catch (e) {
    console.log("Internal server error" + e);
    res
      .status(404)
      .json({ status: "error", message: "Cannot Reshedule Appointment" });
  }
}
