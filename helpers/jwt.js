const jwt = require("jwt-simple");
const moment = require("moment");

const secret = "p70m3tH3uS";

const createToken = async (user) => {

    const payload = {

        id: user._id,
        name: user.name,
        surname: user.surname,
        nick: user.nick,
        email: user.email,
        role: user.role,
        image: user.image,
        iat: moment().unix(),
        exp: moment().add(30, "days").unix()

    };

    //return token
    return jwt.encode(payload, secret);

}

module.exports = {

    createToken,
    secret

}
