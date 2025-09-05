import passport from 'passport';

// Valida token vía estrategia jwt de Passport
export const passportJwt = passport.authenticate('jwt', { session: false });

export const authorize = (...roles) => (req, res, next) => {
    // req.user viene de passport si el token es válido
    if (!req.user) return res.status(401).json({ status: 'error', error: 'No autenticado' });
    if (!roles.length) return next();
    if (!roles.includes(req.user.role)) {
        return res.status(403).json({ status: 'error', error: 'No autorizado' });
    }
    next();
};
