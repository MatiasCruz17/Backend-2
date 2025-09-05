import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { JWT_SECRET, COOKIE_NAME } from './env.js';
import UserModel from '../dao/models/user.model.js';

// Extraer token desde cookie o header Authorization
const cookieExtractor = (req) => {
    if (req && req.cookies) return req.cookies[COOKIE_NAME];
    return null;
};

passport.use('jwt',
    new JwtStrategy(
        {
            jwtFromRequest: ExtractJwt.fromExtractors([
                cookieExtractor,
                ExtractJwt.fromAuthHeaderAsBearerToken()
            ]),
            secretOrKey: JWT_SECRET
        },
        async (jwtPayload, done) => {
            try {
                // Cargar datos de DB
                const user = await UserModel.findById(jwtPayload.id).lean();
                if (!user) return done(null, false, { message: 'Usuario no encontrado' });
                return done(null, user);
            } catch (err) {
                return done(err, false);
            }
        }
    )
);
