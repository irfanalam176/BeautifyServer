import db from "../model/db.js";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";


// Login 
export async function login(req, res) {
  const { email, password } = req.body;

  try {
    const sql = `SELECT * FROM customers WHERE email = ?`;
    const [rows] = await db.execute(sql, [email.trim()]);

    if (rows.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    const user = rows[0];

    // Compare the provided password with the stored hash
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({
        status: "error",
        message: "Invalid email or password",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Login successful",
      data: {
        customerId: user.customer_id,
        name: user.name,
        email: user.email,
      },
    });

  } catch (error) {
    console.log("Login Error:", error.message);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
}

// register 

export async function register(req, res) {
    
    const { name, email, phone, password } = req.body;
  
    const sql = `INSERT INTO customers (customer_id, name, email, phone, password_hash) VALUES (?, ?, ?, ?, ?)`;
  
    try {
      const customerId = uuidv4();
    //   hash function
      const hashedPassword = await bcrypt.hash(password, 10);
  
      const [result] = await db.execute(sql, [customerId, name.trim(), email.trim(), phone.trim(), hashedPassword]);
  
      return res.status(201).json({
        status: "success",
        message: "User registered successfully",
        data: {
          customerId,
          name,
          email,
          phone,
        },
      });
  
    } catch (err) {
      console.error("Error inserting data:", err.message);
  
      if (err.code === "ER_DUP_ENTRY") {
        return res.status(409).json({
          status: "error",
          message: "Email already exists",
        });
      }
  
      return res.status(500).json({
        status: "error",
        message: "Internal server error",
      });
    }
  }

  // admin login
export async function adminLogin(req, res) {
  const { email, password } = req.body;

  try {
    const sql = `SELECT * FROM admin WHERE email = ? AND password_hash = ?`;
    const [rows] = await db.execute(sql, [email.trim(),password]);

    if (rows.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Invalid email or password",
      });
    }

    const user = rows[0];

    return res.status(200).json({
      status: "success",
      message: "Admin Login successful",
      data: {
        customerId: user.customer_id,
        name: user.name,
        email: user.email,
      },
    });

  } catch (error) {
    console.log("Login Error:", error.message);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
}