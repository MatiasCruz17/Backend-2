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

router.post('/register', async (req, res, next) => {
    try {
        const { first_name, last_name, email, age, password } = req.body;

        if (!first_name || !last_name || !email || !age || !password) {
            return res.status(400).json({
                status: 'error',
                message: 'Faltan datos obligatorios'
            });
        }

        const usuarioExistente = await UserModel.findOne({ email });
        if (usuarioExistente) {
            return res.status(409).json({
                status: 'error',
                message: 'Ya hay un usuario con ese email'
            });
        }

        const nuevoUsuario = await UserModel.create({
            first_name,
            last_name,
            email,
            age,
            password: createHash(password),
        });

        res.status(201).json({
            status: 'success',
            data: {
                id: nuevoUsuario._id,
                email: nuevoUsuario.email
            }
        });
    } catch (error) {
        next(error);
    }
});

router.post('/login', async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const usuario = await UserModel.findOne({ email });
        if (!usuario) {
            return res.status(401).json({
                status: 'error',
                message: 'Email o contraseña incorrectos'
            });
        }

        const passwordValido = isValidPassword(password, usuario.password);
        if (!passwordValido) {
            return res.status(401).json({
                status: 'error',
                message: 'Email o contraseña incorrectos'
            });
        }

        const token = signToken({
            id: usuario._id,
            email: usuario.email,
            role: usuario.role
        });

        res.cookie(COOKIE_NAME, token, {
            httpOnly: true,
            sameSite: 'lax',
        });

        res.json({
            status: 'success',
            data: {
                id: usuario._id,
                email: usuario.email,
                role: usuario.role
            }
        });
    } catch (error) {
        next(error);
    }
});

router.get('/current', passportJwt, async (req, res) => {
    const userDto = new UserDTO(req.user);
    res.json({
        status: 'success',
        data: userDto
    });
});

router.post('/logout', (req, res) => {
    res.clearCookie(COOKIE_NAME);
    res.json({
        status: 'success',
        message: 'Sesión cerrada correctamente'
    });
});

router.post('/forgot-password', async (req, res, next) => {
    try {
        const { email } = req.body;

        const usuario = await UserModel.findOne({ email });
        if (!usuario) {
            return res.status(404).json({
                status: 'error',
                message: 'No encontramos un usuario con ese email'
            });
        }

        const token = crypto.randomBytes(32).toString('hex');
        const expiracion = new Date(Date.now() + 3600000); // 1 hora

        await PasswordReset.create({
            email,
            token,
            expiresAt: expiracion
        });

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });

        const linkRecuperacion = `http://localhost:8080/reset-password/${token}`;

        await transporter.sendMail({
            from: '"Mi App" <no-reply@miapp.com>',
            to: email,
            subject: 'Recuperá tu contraseña',
            html: `
                <p>Hola! Recibimos una solicitud para restablecer tu contraseña.</p>
                <p>Hacé click en el siguiente enlace:</p>
                <a href="${linkRecuperacion}">${linkRecuperacion}</a>
                <p><strong>Este enlace vence en 1 hora.</strong></p>
                <p>Si no pediste esto, ignorá este email.</p>
            `
        });

        res.json({
            status: 'success',
            message: 'Te enviamos un email para recuperar tu contraseña'
        });
    } catch (error) {
        next(error);
    }
});

router.post('/reset-password/:token', async (req, res, next) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        const registroToken = await PasswordReset.findOne({ token });
        if (!registroToken) {
            return res.status(400).json({
                status: 'error',
                message: 'El token no es válido'
            });
        }

        if (registroToken.expiresAt < new Date()) {
            return res.status(400).json({
                status: 'error',
                message: 'El token ya expiró, pedí uno nuevo'
            });
        }

        const usuario = await UserModel.findOne({ email: registroToken.email });
        if (!usuario) {
            return res.status(404).json({
                status: 'error',
                message: 'Usuario no encontrado'
            });
        }

        if (isValidPassword(password, usuario.password)) {
            return res.status(400).json({
                status: 'error',
                message: 'La nueva contraseña no puede ser igual a la anterior'
            });
        }

        usuario.password = createHash(password);
        await usuario.save();

        await PasswordReset.deleteOne({ token });

        res.json({
            status: 'success',
            message: 'Contraseña actualizada correctamente'
        });
    } catch (error) {
        next(error);
    }
});

export default router;