import db from "../model/db.js";
import { v4 as uuidv4 } from "uuid";
export async function getItems(req, res) {
  const { q } = req.query;
  try {
    let sql = "";
    if (q === "service") {
      sql = `SELECT service_id AS value, name AS label FROM services`;
    } else if (q === "product") {
      sql = `SELECT product_id AS value, name AS label FROM products`;
    } else {
      return res.status(400).json({ error: "Invalid query parameter" });
    }

    const [response] = await db.query(sql);
    res.status(200).json(response);
  } catch (e) {
    console.log("Internal server error: " + e);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function addSale(req, res) {
  const { type, itemId, quantity } = req.body;
  const saleId = uuidv4();
  let getPriceSql = "";
  let getPriceParams = [];

  if (type === "product") {
    getPriceSql = "SELECT price, stock_quantity FROM products WHERE product_id = ?";
    getPriceParams = [itemId];
  } else if (type === "service") {
    getPriceSql = "SELECT price FROM services WHERE service_id = ?";
    getPriceParams = [itemId];
  } else {
    return res.status(400).json({ status: "error", message: "Invalid item type" });
  }

  try {
    const [rows] = await db.query(getPriceSql, getPriceParams);

    if (rows.length === 0) {
      return res.status(404).json({ status: "error", message: "Item not found" });
    }

    const price = rows[0].price;
    const totalAmount = price * quantity;

    if (type === "product") {
      const currentStock = rows[0].stock_quantity;
      if (quantity > currentStock) {
        return res.status(400).json({ status: "error", message: "Not enough stock available" });
      }
    }

    const insertSql = `
      INSERT INTO sales (sale_id, item_type, item_id, quantity, total_price) 
      VALUES (?, ?, ?, ?, ?)
    `;
    await db.execute(insertSql, [saleId, type, itemId, quantity, totalAmount]);

    // Update stock only for product
    if (type === "product") {
      const updateStockSql = `
        UPDATE products 
        SET stock_quantity = stock_quantity - ? 
        WHERE product_id = ?
      `;
      await db.execute(updateStockSql, [quantity, itemId]);
    }

    res.status(200).json({ status: "success", message: "Sale Added Successfully" });

  } catch (e) {
    console.error("Internal server error: ", e);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
}


export async function dailyProfitLoss(req, res) {
  const sql = `
SELECT
  DATE_FORMAT(CURDATE(), '%Y-%m-%d') AS day,
  IFNULL(s.total_sales, 0) AS total_sales,
  IFNULL(c.total_cost, 0) AS total_cost,
  IFNULL(e.total_expenses, 0) AS total_expenses,
  (
    IFNULL(s.total_sales, 0) - 
    IFNULL(c.total_cost, 0) - 
    IFNULL(e.total_expenses, 0)
  ) AS profit_or_loss
FROM
  -- Total sales today
  (SELECT SUM(total_price) AS total_sales FROM sales WHERE DATE(sale_date) = CURDATE()) AS s,
  
  -- Total purchase cost of sold items today
  (
    SELECT SUM(
      CASE 
        WHEN item_type = 'product' THEN p.cost * sa.quantity
        WHEN item_type = 'service' THEN sv.cost * sa.quantity
        ELSE 0
      END
    ) AS total_cost
    FROM sales sa
    LEFT JOIN products p ON sa.item_type = 'product' AND sa.item_id = p.product_id
    LEFT JOIN services sv ON sa.item_type = 'service' AND sa.item_id = sv.service_id
    WHERE DATE(sa.sale_date) = CURDATE()
  ) AS c,

  -- Total expenses today
  (SELECT SUM(amount) AS total_expenses FROM expenses WHERE DATE(expense_date) = CURDATE()) AS e;

`;
  try {
    const [response] = await db.query(sql);

    res.status(200).json(response[0]);
  } catch (e) {
    console.log("Internal server error" + e);
    res.status(404);
  }
}

export async function monthlyProfitLoss(req, res) {
  const sql = `
SELECT * FROM (
  SELECT
    DATE_FORMAT(d.day, '%Y-%m-%d') AS label,
    IFNULL(s.total_sales, 0) AS total_sales,
    IFNULL(s.total_cost, 0) AS total_cost,
    IFNULL(e.total_expenses, 0) AS total_expenses,
    (IFNULL(s.total_sales, 0) - IFNULL(s.total_cost, 0) - IFNULL(e.total_expenses, 0)) AS profit_or_loss
  FROM (
    SELECT DISTINCT DATE(sale_date) AS day FROM sales
    WHERE MONTH(sale_date) = MONTH(CURDATE()) AND YEAR(sale_date) = YEAR(CURDATE())
    UNION
    SELECT DISTINCT DATE(expense_date) AS day FROM expenses
    WHERE MONTH(expense_date) = MONTH(CURDATE()) AND YEAR(expense_date) = YEAR(CURDATE())
  ) AS d
  LEFT JOIN (
    SELECT 
      DATE(s.sale_date) AS day,
      SUM(s.total_price) AS total_sales,
      SUM(
        CASE 
          WHEN s.item_type = 'product' THEN p.cost * s.quantity
          WHEN s.item_type = 'service' THEN sv.cost * s.quantity
          ELSE 0
        END
      ) AS total_cost
    FROM sales s
    LEFT JOIN products p ON s.item_id = p.product_id AND s.item_type = 'product'
    LEFT JOIN services sv ON s.item_id = sv.service_id AND s.item_type = 'service'
    WHERE MONTH(s.sale_date) = MONTH(CURDATE()) AND YEAR(s.sale_date) = YEAR(CURDATE())
    GROUP BY DATE(s.sale_date)
  ) AS s ON d.day = s.day
  LEFT JOIN (
    SELECT DATE(expense_date) AS day, SUM(amount) AS total_expenses
    FROM expenses
    WHERE MONTH(expense_date) = MONTH(CURDATE()) AND YEAR(expense_date) = YEAR(CURDATE())
    GROUP BY DATE(expense_date)
  ) AS e ON d.day = e.day
) AS daily_report

UNION ALL

SELECT
  'Total for Month' AS label,
  IFNULL(SUM(total_price), 0) AS total_sales,
  IFNULL(SUM(item_cost), 0) AS total_cost,
  IFNULL((SELECT SUM(amount) FROM expenses WHERE MONTH(expense_date) = MONTH(CURDATE()) AND YEAR(expense_date) = YEAR(CURDATE())), 0) AS total_expenses,
  (IFNULL(SUM(total_price), 0) - IFNULL(SUM(item_cost), 0) - IFNULL((SELECT SUM(amount) FROM expenses WHERE MONTH(expense_date) = MONTH(CURDATE()) AND YEAR(expense_date) = YEAR(CURDATE())) , 0)) AS profit_or_loss
FROM (
  SELECT 
    s.total_price,
    CASE 
      WHEN s.item_type = 'product' THEN p.cost * s.quantity
      WHEN s.item_type = 'service' THEN sv.cost * s.quantity
      ELSE 0
    END AS item_cost
  FROM sales s
  LEFT JOIN products p ON s.item_id = p.product_id AND s.item_type = 'product'
  LEFT JOIN services sv ON s.item_id = sv.service_id AND s.item_type = 'service'
  WHERE MONTH(s.sale_date) = MONTH(CURDATE()) AND YEAR(s.sale_date) = YEAR(CURDATE())
) AS totals;


  `;
  try {
    const [response] = await db.query(sql);

    res.status(200).json(response);
  } catch (e) {
    console.log("Internal server error" + e);
    res.status(404);
  }
}
