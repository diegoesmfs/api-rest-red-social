const mongoose = require("mongoose");
const connection = async () => {

    try {

        await mongoose.connect("mongodb://127.0.0.1:27017/prometheus");

        console.log("connected to: prometheus");

    } catch (error) {
        console.log(error);
        throw new Error("Failed connection to the database");
    }

}

module.exports = connection
