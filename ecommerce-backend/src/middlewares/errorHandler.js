export default (error, req, res, next) => {
    console.error('Error capturado:', error);

    if (error.name === 'ValidationError') {
        return res.status(400).json({
            status: 'error',
            message: 'Datos inválidos',
            detalles: error.message
        });
    }

    if (error.name === 'CastError') {
        return res.status(400).json({
            status: 'error',
            message: 'ID inválido'
        });
    }

    if (error.code === 11000) {
        return res.status(409).json({
            status: 'error',
            message: 'Ya existe un registro con esos datos'
        });
    }

    if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
            status: 'error',
            message: 'Token inválido'
        });
    }

    if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
            status: 'error',
            message: 'La sesión expiró, volvé a iniciar sesión'
        });
    }

    res.status(error.statusCode || 500).json({
        status: 'error',
        message: error.message || 'Algo salió mal en el servidor'
    });
};