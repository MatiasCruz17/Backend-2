import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { JWT_SECRET, COOKIE_NAME } from './env.js';
import UserModel from '../dao/models/user.model.js';


const obtenerTokenDeCookie = (req) => {
    if (req && req.cookies) {
        return req.cookies[COOKIE_NAME];
    }
    return null;
};


passport.use('jwt',
    new JwtStrategy(
        {
            jwtFromRequest: ExtractJwt.fromExtractors([
                obtenerTokenDeCookie,
                ExtractJwt.fromAuthHeaderAsBearerToken()
            ]),
            secretOrKey: JWT_SECRET
        },
        async (payload, done) => {
            try {
                const usuario = await UserModel.findById(payload.id).lean();
                
                if (!usuario) {
                    return done(null, false, { message: 'Usuario no encontrado' });
                }
                return done(null, usuario);
            } catch (error) {
                return done(error, false);
            }
        }
    )
);