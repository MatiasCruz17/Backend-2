import { Router } from 'express';
import userRepository from '../repositories/user.repository.js';
import { passportJwt, authorize } from '../middlewares/auth.js';

const router = Router();

// Listar usuarios (solo admin)
router.get('/', passportJwt, authorize('admin'), async (req, res, next) => {
    try {
        const users = await userRepository.getAll();
        res.json({ status: 'success', payload: users });
    } catch (err) { next(err); }
});

// Obtener uno (admin o el user)
router.get('/:id', passportJwt, async (req, res, next) => {
    try {
        const { id } = req.params;
        if (req.user.role !== 'admin' && String(req.user._id) !== id) {
            return res.status(403).json({ status: 'error', error: 'No autorizado' });
        }
        const user = await userRepository.getById(id);
        if (!user) return res.status(404).json({ status: 'error', error: 'Usuario no encontrado' });
        res.json({ status: 'success', payload: user });
    } catch (err) { next(err); }
});

// Crear (admin)
router.post('/', passportJwt, authorize('admin'), async (req, res, next) => {
    try {
        const { first_name, last_name, email, age, password, role } = req.body;
        const exists = await userRepository.getByEmail(email);
        if (exists) return res.status(409).json({ status: 'error', error: 'Email ya registrado' });

        const user = await userRepository.create({
            first_name, last_name, email, age,
            password,
            role: role || 'user'
        });
        res.status(201).json({ status: 'success', payload: { id: user._id, email: user.email } });
    } catch (err) { next(err); }
});

// Actualizar (admin o el user)
router.put('/:id', passportJwt, async (req, res, next) => {
    try {
        const { id } = req.params;
        if (req.user.role !== 'admin' && String(req.user._id) !== id) {
            return res.status(403).json({ status: 'error', error: 'No autorizado' });
        }
        const update = { ...req.body };
        const user = await userRepository.update(id, update)
        if (!user) return res.status(404).json({ status: 'error', error: 'Usuario no encontrado' });
        res.json({ status: 'success', payload: user });
    } catch (err) { next(err); }
});

// Eliminar (admin)
router.delete('/:id', passportJwt, authorize('admin'), async (req, res, next) => {
    try {
        const { id } = req.params;
        const del = await userRepository.delete(id);
        if (!del) return res.status(404).json({ status: 'error', error: 'Usuario no encontrado' });
        res.json({ status: 'success', message: 'Usuario eliminado' });
    } catch (err) { next(err); }
});

export default router;
