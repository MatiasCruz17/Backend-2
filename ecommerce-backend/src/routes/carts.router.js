import { Router } from "express";
import Cart from '../dao/models/cart.model.js'
import Product from '../dao/models/product.model.js'
import { passportJwt } from '../middlewares/auth.js'

const router = Router();

router.post ('/', passportJwt, async(req, res, next) => {
    try {
        const nuevoCarrito = await Cart.create({ user:req.user._id, products: []});
        res.status(201).json({ status: 'success', data: nuevoCarrito });
    } catch (error) { next(error); }
})

router.get('/:cid', passportJwt, async(req, res, next) => {
    try {
        const carrito = await Cart.findById(req.params.cid).populate('products.product').lean();
        if (!carrito) return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });
        res.json({ status: 'success', data: carrito });
    } catch (error) { next(error);}
});

router.post('/:cid/product/:pid', passportJwt, async (req, res, next) => {
    try {
        const carrito = await Cart.findById(req.params.cid);
        if (!carrito) return res.status(404).json({ status: 'error', message: 'Producto no encontrado' });

        const item = carrito.products.find (p => String (p.product) === req.params.pid);
        if (item) {
            item.quantity += 1;
        } else {
            carrito.products.push({ product: req.params.pid, quantity: 1 });
        }

        await carrito.save();
        res.json({ status: 'success', data: carrito });
    } catch (error) { next(error) }
});

router.delete('/:cid/product/:pid', passportJwt, async (req, res, next) => {
    try {
        const carrito = await Cart.findById(req.params.cid);
        if (!carrito) return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });

        carrito.products = carrito.products.filter (p => String(p.product) !== req.params.pid);
        await carrito.save();
        res.json({ status: 'success', data: carrito });
    } catch (error) {next(error);}
});

router.delete ('/:cid', passportJwt, async (req, res, next) => {
    try {
        const carrito = await Cart.findById(req.params.cid);
        if (!carrito) return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });

        carrito.products = [];
        await carrito.save();
        res.json ({ status: 'success', message: 'Carrito vaciado' });
    } catch (error) { next(error); }
});

export default router;