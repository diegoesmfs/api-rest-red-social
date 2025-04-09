const validator = require("validator");

const validate = async (params) => {

    let name = !validator.isEmpty(params.name) &&
        validator.isLength(params.name, { min: 3, max: undefined }) &&
        validator.isAlpha(params.name);

    let surname = !validator.isEmpty(params.surname) &&
        validator.isLength(params.surname, { min: 3, max: undefined }) &&
        validator.isAlpha(params.surname);

    let nick = !validator.isEmpty(params.nick) &&
        validator.isLength(params.nick, { min: 2, max: undefined });

    let email = !validator.isEmpty(params.email) &&
        validator.isLength(params.email, { min: 3, max: undefined }) &&
        validator.isEmail(params.email);

    let password = !validator.isEmpty(params.password) &&
        validator.isLength(params.password, { min: 8, max: undefined });

    let bio = true;

    if (params.bio) {

        let bio = validator.isLength(params.bio, { min: undefined, max: 255 });

    }

    if (!name) {
        throw new Error("Invalid name: must be at least 3 characters long and contain only letters.");
    }
    if (!surname) {
        throw new Error("Invalid surname: must be at least 3 characters long and contain only letters.");
    }
    if (!nick) {
        throw new Error("Invalid nick: must be at least 2 characters long.");
    }
    if (!email) {
        throw new Error("Invalid email: must be a valid email address.");
    }
    if (!password) {
        throw new Error("Invalid password: must be at least 8 characters long.");
    }
    if (!bio) {
        throw new Error("Invalid bio: must be at most 255 characters long.");
    }

    console.log("Validation surpassed");

}

module.exports = validate