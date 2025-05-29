// db.js
import mysql from "mysql2/promise";

// const db = await mysql.createConnection({
//   host: "localhost",
//   user: "root",
//   password: "",
//   database: "beautifydb"
// });

// export default db;



const db = await mysql.createConnection({
  host: "sql.freedb.tech",
  user: "freedb_beautifydbuser",
  password: "WU$SRww9Z#?Jrys",
  database: "freedb_beautifydb"
});

export default db;
