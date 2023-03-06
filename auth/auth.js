const jwt = require('jsonwebtoken');
const secret = 'chodhich poyavan oombi'
let authenticateToken;
let generateAccessToken;
authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (token == null) return res.send({error:'no authentication token'}).status(401)

    jwt.verify(token, secret, (err, user) => {
        console.log(err)
        if (err) return res.send({error:'authentication failed'}).status(403)
        req.user = user
        next()
    })
}
generateAccessToken = (id) => {
     console.log("auth id",id.toString())
    return jwt.sign(id.toString(), secret);
}

module.exports = {authenticateToken, generateAccessToken}