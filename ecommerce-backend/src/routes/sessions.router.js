import { Router } from 'express';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

import UserModel from '../dao/models/user.model.js';
import PasswordReset from '../dao/models/passwordReset.model.js';
import { createHash, isValidPassword } from '../utils/crypto.js';
import { signToken } from '../services/token.service.js';
import { passportJwt } from '../middlewares/auth.js';
import { COOKIE_NAME } from '../config/env.js';
import UserDTO from '../dao/dtos/user.dto.js';

const router = Router();

// POST /api/sessions/register
router.post('/register', async (req, res, next) => {
    try {
        const { first_name, last_name, email, age, password } = req.body;

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

        const token = signToken({
            id: user._id,
            email: user.email,
            role: user.role
        });

        if (withCookie) {
            res.cookie(process.env.COOKIE_NAME || 'jwt', token, {
                httpOnly: true,
                sameSite: 'lax',
            });
        }

        res.json({
            status: 'success',
            token: withCookie ? undefined : token,
            payload: { id: user._id, email: user.email, role: user.role }
        });
    } catch (err) { next(err); }
});

// GET /api/sessions/current
router.get('/current', passportJwt, async (req, res) => {
    const userDto = new UserDTO(req.user);
    res.json({ status: 'success', payload: userDto });
});

// POST /api/sessions/logout
router.post('/logout', (req, res) => {
    res.clearCookie(COOKIE_NAME);
    res.json({ status: 'success', message: 'Sesión cerrada' });
});

router.post('/forgot-password', async (req, res, next) => {
    try {
        const { email } = req.body;
        const user = await UserModel.findOne({ email });
        if (!user) {
            return res.status(404).json({ status: 'error', error: 'Usuario no encontrado' });
        }

        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 3600000);

        await PasswordReset.create({ email, token, expiresAt });

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });

        const resetLink = `http://localhost:8080/reset-password/${token}`;

        await transporter.sendMail({
            from: '"Mi App" <no-reply@miapp.com>',
            to: email,
            subject: 'Recuperación de contraseña',
            html: `<p>Hacé click para restablecer tu contraseña:</p>
                   <a href="${resetLink}">${resetLink}</a>
                   <p>Este enlace expira en 1 hora.</p>`
        });

        res.json({ status: 'success', message: 'Correo de recuperación enviado' });
    } catch (err) { next(err); }
});

router.post('/reset-password/:token', async (req, res, next) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        const record = await PasswordReset.findOne({ token });
        if (!record) return res.status(400).json({ status: 'error', error: 'Token inválido' });
        if (record.expiresAt < new Date()) {
            return res.status(400).json({ status: 'error', error: 'Token expirado' });
        }

        const user = await UserModel.findOne({ email: record.email });
        if (!user) return res.status(404).json({ status: 'error', error: 'Usuario no encontrado' });

        if (isValidPassword(password, user.password)) {
            return res.status(400).json({ status: 'error', error: 'No puede ser igual a la anterior' });
        }

        user.password = createHash(password);
        await user.save();

        await PasswordReset.deleteOne({ token });

        res.json({ status: 'success', message: 'Contraseña actualizada' });
    } catch (err) { next(err); }
});

export default router;
