export default (err, req, res, next) => {
    console.error('', err);
    res.status(500).json({ status: 'error', error: 'Error interno del servidor' });
};
