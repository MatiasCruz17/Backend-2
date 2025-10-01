import { Router } from 'express';
import Product from '../dao/models/product.model.js';
import { passportJwt, authorize } from '../middlewares/auth.js';

const router = Router();

// Listar productos (todos pueden ver)
router.get('/', async (req, res, next) => {
    try {
        const products = await Product.find().lean();
        res.json({ status: 'success', payload: products });
    } catch (err) { next(err); }
});

// Obtener un producto por id
router.get('/:id', async (req, res, next) => {
    try {
        const prod = await Product.findById(req.params.id).lean();
        if (!prod) return res.status(404).json({ status: 'error', error: 'Producto no encontrado' });
        res.json({ status: 'success', payload: prod });
    } catch (err) { next(err); }
});

// Crear producto (solo admin)
router.post('/', passportJwt, authorize('admin'), async (req, res, next) => {
    try {
        const newProd = await Product.create(req.body);
        res.status(201).json({ status: 'success', payload: newProd });
    } catch (err) { next(err); }
});

// Actualizar producto (solo admin)
router.put('/:id', passportJwt, authorize('admin'), async (req, res, next) => {
    try {
        const upd = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true }).lean();
        if (!upd) return res.status(404).json({ status: 'error', error: 'Producto no encontrado' });
        res.json({ status: 'success', payload: upd });
    } catch (err) { next(err); }
});

// Eliminar producto (solo admin)
router.delete('/:id', passportJwt, authorize('admin'), async (req, res, next) => {
    try {
        const del = await Product.findByIdAndDelete(req.params.id);
        if (!del) return res.status(404).json({ status: 'error', error: 'Producto no encontrado' });
        res.json({ status: 'success', message: 'Producto eliminado' });
    } catch (err) { next(err); }
});

export default router;
