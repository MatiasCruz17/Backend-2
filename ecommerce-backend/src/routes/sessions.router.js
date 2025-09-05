import { Router } from 'express';
import UserModel from '../dao/models/user.model.js';
import { createHash, isValidPassword } from '../utils/crypto.js';
import { signToken } from '../services/token.service.js';
import { passportJwt } from '../middlewares/auth.js';
import { COOKIE_NAME } from '../config/env.js';

const router = Router();

// POST /api/sessions/register
router.post('/register', async (req, res, next) => {
    try {
        const { first_name, last_name, email, age, password } = req.body;

        // Validaciones mínimas
        if (!first_name || !last_name || !email || !age || !password) {
            return res.status(400).json({ status: 'error', error: 'Campos requeridos faltantes' });
        }

        const exists = await UserModel.findOne({ email });
        if (exists) return res.status(409).json({ status: 'error', error: 'Email ya registrado' });

        const user = await UserModel.create({
            first_name, last_name, email, age,
            password: createHash(password), 
        });

        res.status(201).json({
            status: 'success',
            payload: { id: user._id, email: user.email }
        });
    } catch (err) { next(err); }
});

// POST /api/sessions/login (genera JWT)
router.post('/login', async (req, res, next) => {
    try {
        const { email, password, withCookie = true } = req.body;

        const user = await UserModel.findOne({ email });
        if (!user) return res.status(401).json({ status: 'error', error: 'Credenciales inválidas' });

        const valid = isValidPassword(password, user.password);
        if (!valid) return res.status(401).json({ status: 'error', error: 'Credenciales inválidas' });

        // Payload mínimo
        const token = signToken({
            id: user._id,
            email: user.email,
            role: user.role
        });

        if (withCookie) {
            res.cookie(process.env.COOKIE_NAME || 'jwt', token, {
                httpOnly: true,
                sameSite: 'lax',
                // secure: true // activalo si usás HTTPS
            });
        }

        res.json({
            status: 'success',
            token: withCookie ? undefined : token,
            payload: { id: user._id, email: user.email, role: user.role }
        });
    } catch (err) { next(err); }
});

// GET /api/sessions/current (valida usuario y devuelve datos del JWT)
router.get('/current', passportJwt, async (req, res) => {
    
    const { _id, first_name, last_name, email, age, role, cart } = req.user;
    res.json({
        status: 'success',
        payload: { id: _id, first_name, last_name, email, age, role, cart }
    });
});

// POST /api/sessions/logout
router.post('/logout', (req, res) => {
    res.clearCookie(COOKIE_NAME);
    res.json({ status: 'success', message: 'Sesión cerrada' });
});

export default router;
