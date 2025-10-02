import { Router } from "express";
import Cart from '../dao/models/cart.model.js';
import Ticket from '../dao/models/ticket.model.js';
import Product from '../dao/models/product.model.js';
import { passportJwt } from '../middlewares/auth.js';
import crypto from 'crypto';

const router = Router();

router.post('/:cid/purchase', passportJwt, async (req, res, next) => {
    try {
        const carrito = await Cart.findById(req.params.cid).populate ('products.product');
        if(!carrito) {
            return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });
        }

        let total = 0;
        const productosComprados = [];

        for (let item of carrito.products) {
            const producto = await Product.findById(item.product._id);
            if (producto && producto.stock >= item.quantity) {
                producto.stock -= item.quantity;
                await producto.save();
                total += producto.price * item.quantity;
                productosComprados.push(item);
            }
        }
        carrito.products = [];
        await carrito.save();

        const ticket = await Ticket.create({
            code: crypto.randomBytes(6).toString('hex'),
            amount: total,
            purchaser: req.user.email
        });

        res.status(201).json ({ status: 'success', data: ticket });
    } catch (error) { next(error); }
});

export default router;