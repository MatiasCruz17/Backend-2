// services/passwordReset.service.js
import jwt from 'jsonwebtoken';
import { createHash, isValidPassword } from '../utils/crypto.js';
import UserModel from '../dao/models/user.model.js';

const SECRET = process.env.RESET_SECRET || 'reset-secret';

export const createResetToken = (email) => {
    return jwt.sign({ email }, SECRET, { expiresIn: '1h' });
};

export const verifyResetToken = (token) => {
    try {
        return jwt.verify(token, SECRET);
    } catch {
        return null;
    }
};

export const resetPassword = async (email, newPassword) => {
    const user = await UserModel.findOne({ email });
    if (!user) throw new Error('Usuario no encontrado');

    if (isValidPassword(newPassword, user.password)) {
        throw new Error('La nueva contraseña no puede ser igual a la anterior');
    }

    user.password = createHash(newPassword);
    await user.save();
    return user;
};
