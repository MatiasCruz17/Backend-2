import { Router } from 'express';
import Product from '../dao/models/product.model.js';
import { passportJwt, authorize } from '../middlewares/auth.js';

const router = Router();

router.get('/', async (req, res, next) => {
    try {
        const productos = await Product.find().lean();
        res.json({
            status: 'success',
            data: productos
        });
    } catch (error) {
        next(error);
    }
});

router.get('/:id', async (req, res, next) => {
    try {
        const producto = await Product.findById(req.params.id).lean();

        if (!producto) {
            return res.status(404).json({
                status: 'error',
                message: 'No encontramos ese producto'
            });
        }

        res.json({
            status: 'success',
            data: producto
        });
    } catch (error) {
        next(error);
    }
});

router.post('/', passportJwt, authorize('admin'), async (req, res, next) => {
    try {
        const nuevoProducto = await Product.create(req.body);
        res.status(201).json({
            status: 'success',
            data: nuevoProducto
        });
    } catch (error) {
        next(error);
    }
});

router.put('/:id', passportJwt, authorize('admin'), async (req, res, next) => {
    try {
        const productoActualizado = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        ).lean();

        if (!productoActualizado) {
            return res.status(404).json({
                status: 'error',
                message: 'No encontramos ese producto'
            });
        }

        res.json({
            status: 'success',
            data: productoActualizado
        });
    } catch (error) {
        next(error);
    }
});

router.delete('/:id', passportJwt, authorize('admin'), async (req, res, next) => {
    try {
        const productoEliminado = await Product.findByIdAndDelete(req.params.id);

        if (!productoEliminado) {
            return res.status(404).json({
                status: 'error',
                message: 'No encontramos ese producto'
            });
        }

        res.json({
            status: 'success',
            message: 'Producto eliminado correctamente'
        });
    } catch (error) {
        next(error);
    }
});

export default router;