import jwt from 'jsonwebtoken';
import { JWT_SECRET, JWT_EXPIRES } from '../config/env.js';

export const signToken = (payload) =>
    jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });

export const verifyToken = (token) =>
    jwt.verify(token, JWT_SECRET);
