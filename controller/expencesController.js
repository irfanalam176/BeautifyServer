import { v4 as uuidv4 } from "uuid";
import db from "../model/db.js";
export async function addExpences(req, res) {
  const { description, price } = req.body;
  const sql = `INSERT INTO expenses(expense_id, description, amount) VALUES (?,?,?)`;
  const expencesId = uuidv4();
  try {
    const [response] = await db.execute(sql, [expencesId, description, price]);
    res.status(200).json({ status: "success", message: "Expences Added" });
  } catch (e) {
    console.log("Internal server error" + e);
    res.status(400);
  }
}

// get expenses
export async function getExpences(req, res) {
  const getExpensesSql = `SELECT * FROM expenses ORDER BY expense_date DESC`;
  const getTotalSql = `SELECT SUM(amount) AS total_expenses FROM expenses`;

  try {
    const [expenses] = await db.query(getExpensesSql);
    const [totalResult] = await db.query(getTotalSql);
    const total = totalResult[0]?.total_expenses || 0;

    res.status(200).json({
      expenses,
      total
    });
  } catch (e) {
    console.log("Internal server error: " + e);
    res.status(400).json({ status: "error", message: "cannot get expenses" });
  }
}
// get expenses by id
export async function getExpencesById(req, res) {
    const id = req.params.id
    
  const sql = `SELECT * FROM expenses WHERE expense_id = ?`;

  try {
    const [response] = await db.execute(sql,[id]);

    res.status(200).json(response[0]);
  } catch (e) {
    console.log("Internal server error: " + e);
    res.status(400).json({ status: "error", message: "cannot get expenses" });
  }
}

// delete expenses
export async function deleteExpences(req,res){
    const id = req.params.id
    const sql = `DELETE FROM expenses WHERE expense_id=?`
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

// update expenses
export async function updateExpences(req, res) {
  const id = req.params.id;
  const { description, price } = req.body;

  if (!description || !price) {
    return res.status(400).json({
      status: "error",
      message: "Description and price are required",
    });
  }

  const sql = `UPDATE expenses SET description = ?, amount = ? WHERE expense_id = ?`;

  try {
    const [response] = await db.execute(sql, [description, price, id]);

    if (response.affectedRows > 0) {
      return res.status(200).json({
        status: "success",
        message: "Record Updated",
      });
    } else {
      return res.status(404).json({
        status: "error",
        message: "Expense not found or no changes made",
      });
    }
  } catch (e) {
    console.error("Cannot Update Record:", e);
    return res.status(500).json({
      status: "error",
      message: "Internal server error while updating expense",
    });
  }
}
