import { Router } from 'express';
import UserModel from '../dao/models/user.model.js';
import { createHash } from '../utils/crypto.js';
import { passportJwt, authorize } from '../middlewares/auth.js';

const router = Router();

// Listar usuarios (solo admin)
router.get('/', passportJwt, authorize('admin'), async (req, res, next) => {
    try {
        const users = await UserModel.find().select('-password').lean();
        res.json({ status: 'success', payload: users });
    } catch (err) { next(err); }
});

// Obtener uno (admin o el propio user)
router.get('/:id', passportJwt, async (req, res, next) => {
    try {
        const { id } = req.params;
        if (req.user.role !== 'admin' && String(req.user._id) !== id) {
            return res.status(403).json({ status: 'error', error: 'No autorizado' });
        }
        const user = await UserModel.findById(id).select('-password').lean();
        if (!user) return res.status(404).json({ status: 'error', error: 'Usuario no encontrado' });
        res.json({ status: 'success', payload: user });
    } catch (err) { next(err); }
});

// Crear (admin) – útil para pruebas
router.post('/', passportJwt, authorize('admin'), async (req, res, next) => {
    try {
        const { first_name, last_name, email, age, password, role } = req.body;
        const exists = await UserModel.findOne({ email });
        if (exists) return res.status(409).json({ status: 'error', error: 'Email ya registrado' });

        const user = await UserModel.create({
            first_name, last_name, email, age,
            password: createHash(password),
            role: role || 'user'
        });
        res.status(201).json({ status: 'success', payload: { id: user._id, email: user.email } });
    } catch (err) { next(err); }
});

// Actualizar (admin o el propio user)
router.put('/:id', passportJwt, async (req, res, next) => {
    try {
        const { id } = req.params;
        if (req.user.role !== 'admin' && String(req.user._id) !== id) {
            return res.status(403).json({ status: 'error', error: 'No autorizado' });
        }
        const update = { ...req.body };
        if (update.password) {
            update.password = createHash(update.password); // re-hash si cambia
        }
        const user = await UserModel.findByIdAndUpdate(id, update, { new: true })
            .select('-password')
            .lean();
        if (!user) return res.status(404).json({ status: 'error', error: 'Usuario no encontrado' });
        res.json({ status: 'success', payload: user });
    } catch (err) { next(err); }
});

// Eliminar (admin)
router.delete('/:id', passportJwt, authorize('admin'), async (req, res, next) => {
    try {
        const { id } = req.params;
        const del = await UserModel.findByIdAndDelete(id);
        if (!del) return res.status(404).json({ status: 'error', error: 'Usuario no encontrado' });
        res.json({ status: 'success', message: 'Usuario eliminado' });
    } catch (err) { next(err); }
});

export default router;
