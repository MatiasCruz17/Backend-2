import passport from 'passport';

export const passportJwt = passport.authenticate('jwt', { session: false });

export const authorize = (...rolesPermitidos) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                status: 'error',
                message: 'Tenés que estar logueado para hacer esto'
            });
        }

        if (rolesPermitidos.length === 0) {
            return next();
        }

        if (!rolesPermitidos.includes(req.user.role)) {
            return res.status(403).json({
                status: 'error',
                message: 'No tenés permisos para hacer esto'
            });
        }

        next();
    };
};