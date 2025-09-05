import './app.js';
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const PORT = process.env.PORT || 8080;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/ecommerce-backend";

const start = async () => {
    try {
        await mongoose.connect(MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log("MongoDB conectado");

        app.listen(PORT, () => {
            console.log(`Server escuchando en http://localhost:${PORT}`);
        });
    } catch (err) {
        console.error("Error arrancando servidor:", err);
        process.exit(1);
    }
};

start();