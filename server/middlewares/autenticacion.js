const jwt = require('jsonwebtoken');
// ================================
// Verificar Token
// ================================
let verificaToken = (req, res, next) => {

    let token = req.get('token');

    jwt.verify( token, process.env.SEED, (err, decode) =>{
        if ( err ){
            return res.status(401).json({
                ok: false,
                err: {
                    message: 'Token no válido'
                }
            });
        }

        req.usuario = decode.usuario;
        next();

    });

};

// ================================
// Verificar AdminRole
// ================================
let verificaAdminRole = (req, res, next) => {
    // req.usuario ya quedó cargado en el primer middleware
    let usuario = req.usuario;
    let role = usuario.role;
    if (!(role === 'ADMIN_ROLE')){
        return res.status(401).json({
            ok: false,
            err: {
                usuario,
                message: "El usuario no es administrador"
            }
        });
    };
    next();
};

// ================================
// Verificar TokenImg
// ================================
let verificaTokenImg = (req, res, next) => {

    let token = req.query.token;

    jwt.verify( token, process.env.SEED, (err, decode) =>{
        if ( err ){
            return res.status(401).json({
                ok: false,
                err: {
                    message: 'Token no válido'
                }
            });
        }

        req.usuario = decode.usuario;
        next();

    });
}


module.exports = {
    verificaToken,
    verificaAdminRole,
    verificaTokenImg
}