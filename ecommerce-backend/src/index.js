import app from './app.js';
import mongoose from "mongoose";
import dotenv from "dotenv";
import { Server } from 'socket.io'
import Product from './dao/models/product.model.js'


dotenv.config();

const PORT = process.env.PORT || 8080;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/ecommerce-backend";

const start = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("MongoDB conectado");

        const httpServer = app.listen(PORT, () => {
            console.log(`Server escuchando en http://localhost:${PORT}`);
        })

        const io = new Server (httpServer)
        io.on('connection', socket => {
            console.log('Cliente conectado')
            socket.on('nuevoProducto', async data => {
                try{
                    if (!data.title || !data.price) return
                    await Product.create ({
                        title: data.title,
                        price: Number(data.price),
                        description: data.description || ''
                    })
                    const productos = await Product.find().lean()
                    io.emit('productosActualizados', productos)
                }catch (error) {
                    console.error('Error al crear producto', error)
                }
            })
        })
    } catch (err) {
        console.error("Error arrancando servidor:", err);
        process.exit(1);
    }
};

start();