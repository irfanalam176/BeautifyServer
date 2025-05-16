import express from "express";
import authRouter from "./routes/auth.js";
import productsRouter from "./routes/products.js";
import { fileURLToPath } from "url";
import path from "path";
import BeauticianRouter from "./routes/beautician.js";
import servicesRouter from "./routes/services.js";
import appointmentRouter from "./routes/appointment.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware - important to keep these for non-file routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/auth", authRouter);
app.use("/products", productsRouter);
app.use("/beautician", BeauticianRouter);
app.use("/services", servicesRouter);
app.use("/appointment", appointmentRouter);

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.listen(3000, () => console.log("http://localhost:3000"));