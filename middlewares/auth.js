const jwt = require("jwt-simple");
const moment = require("moment");
const libJwt = require("../helpers/jwt");
const secret = libJwt.secret;

//MiddleWare authentification

exports.auth= async (req, res, next) => {

    if(!req.headers.authorization){

        return res.status(403).send({

            status: "Error",
            message: "The request needs the authorization header"

        });

    }
    
    let token = req.headers.authorization.replace(/['"]+/g, '');

    try {
        
        let payload = jwt.decode(token, secret);

        if(payload.exp <= moment().unix()){

            return res.status(401).send({

                status: "Error",
                message: "Expired Token"
    
            });

        }

        req.user = payload;


    } catch (error) {
        return res.status(404).send({

            status: "Error",
            message: "Invalid Token"

        });
    }

    next();


}