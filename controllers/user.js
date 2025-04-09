const User = require("../models/user");
const bcrypt = require("bcrypt");
const path = require("path");
const fs = require("fs");
const jwt = require("../helpers/jwt");
const moongosePaginate = require("mongoose-pagination");
const Publication = require("../models/publication");
const Follow = require("../models/follows");
const followHelper = require("../helpers/followUserIds");
const validate = require("../helpers/validate");

const userTest = (req, res) => {

    return res.status(200).send({

        message: "delivered from ./controllers/users.js"

    });

}

// Users Register
const register = async (req, res) => {
    // Get the data
    let parameters = req.body;
    console.log(parameters);

    // Validation
    if (!parameters.name || !parameters.email || !parameters.password || !parameters.nick || !parameters.bio) {
        return res.status(400).json({
            status: "error",
            message: "Requirements missing"
        });
    }

    try {
        //advanced validation
       await validate(parameters);
    } catch (error) {
        return res.status(500).send({
            status: "error",
            message: "Invalid type of data"
        });
    }

    try {

        // Checking that the new user doesn't exist already
        const users = await User.find({
            $or: [
                { email: parameters.email.toLowerCase() },
                { nick: parameters.nick.toLowerCase() }
            ]
        });

        if (users.length >= 1) {
            return res.status(200).send({
                status: "error",
                message: "The user already exists"
            });
        }

        // Crypt the password
        let pwd = await bcrypt.hash(parameters.password, 10);
        parameters.password = pwd;

        // Create an object of the user
        let newUser = new User(parameters);

        // Save the user in the database
        const userStored = await newUser.save();

        return res.status(200).json({
            status: "success",
            message: "User  has been saved in the database",
            user: userStored
        });

    } catch (error) {
        console.error(error); // Log the error for debugging
        return res.status(500).send({
            status: "error",
            message: "An error has occurred while processing your request"
        });
    }
}

//Login
const login = async (req, res) => {

    //get the parameters

    let parameters = req.body;

    if (!parameters.email || !parameters.password) {

        return res.status(400).send({

            status: "Error",
            message: "Missing login data"

        });

    }

    //check if the user exist

    let logUser = await User.findOne({ email: parameters.email });

    if (!logUser) {

        return res.status(404).json({

            status: "Not Found",
            message: "The user does not exist in prometheus please sing in"

        });

    }

    //check the password

    let pwd = bcrypt.compareSync(parameters.password, logUser.password)

    if (!pwd) {

        return res.status(400).send({

            status: "Error",
            message: "Wrong password"

        })

    }

    //return token

    const token = await jwt.createToken(logUser);

    //return user data

    return res.status(200).send({

        message: "user logged :)",
        logUser: {

            id: logUser._id,
            name: logUser.name,
            nick: logUser.nick

        },
        token

    });

}

//Users Profile
const profile = async (req, res) => {

    const id = req.params.id;

    try {

        const userProfile = await User.findById(id).select({ password: 0, role: 0 });
        //return follows and followers
        const followInfo = await followHelper.profileData(req.user.id, id);

        return res.status(200).send({

            status: "succes",
            user: userProfile,
            following: followInfo.following,
            follower: followHInfo.follower

        })

    } catch (error) {

        return res.status(404).send({

            status: "Error",
            message: "No user by the provided ID ",

        })
    }

}

//Users In Prometheus
const list = async (req, res) => {

    //actual page by params
    let page = 1;
    if (req.params.page) {

        page = req.params.page;

    }
    page = parseInt(page);

    //request with mongoose

    let itemsPerPage = 3;

    //count the total of users in prometheus
    const total = await User.countDocuments();

    try {

        const usersList = await User.find().sort('_id').select("-email -password -__v -role -name -surname").paginate(page, itemsPerPage);

        let followUserIds = await followHelper.followUserIds(req.user.id);

        //return
        return res.status(200).send({

            status: "success",
            message: "users List",
            usersList,
            following: followUserIds.following,
            follower: followUserIds.follower,
            page,
            itemsPerPage,
            pages: Math.ceil(total / itemsPerPage)

        });

    } catch (error) {

        console.log(error)

        return res.status(500).send({

            status: "Error",
            message: "No users in prometheus",

        });

    }

}

//Update User Data
const update = async (req, res) => {

    //get the parametes

    let updatedUser = req.user;
    let updatedData = req.body;

    // Checking that the new user doesn't exist already
    const users = await User.find({
        $or: [
            { email: updatedData.email.toLowerCase() },
            { nick: updatedData.nick.toLowerCase() }
        ]
    });

    let userIsset = false;

    users.forEach(user => {

        if (user && user._id != updatedUser.id) userIsset = true;

    })

    if (userIsset) {
        return res.status(200).send({
            status: "error",
            message: "The user already exists"
        });
    }


    // Crypt the password

    if (updatedData.password) {

        let pwd = await bcrypt.hash(updatedData.password, 10);
        updatedData.password = pwd;

    } else {
        delete updatedData.password;
    }

    //find and update the user

    try {

        let userUpdated = await User.findByIdAndUpdate({ _id: updatedUser.id }, updatedData, { new: true });

        //delete useless data
        delete userUpdated.iat;
        delete userUpdated.exp;
        delete userUpdated.role;

        return res.status(200).send({

            status: "success",
            message: "The user has updated their data",
            user: userUpdated

        });

    } catch (error) {
        console.error(error); // Log the error for debugging
        return res.status(500).send({
            status: "error",
            message: "An error has occurred while processing your request"
        });
    }
}

//Upload Files
const upload = async (req, res) => {

    //get the file

    if (!req.file) {

        return res.status(404).send({

            status: "error",
            message: "The request needs the image"

        });

    }

    // get the file original name

    let image = req.file.originalname;
    const existingUser = await User.findById(req.user.id);
    console.log(req.user.id);
    if (!existingUser) {
        return res.status(404).send({
            status: "error",
            message: "User  not found"
        });
    }

    //get the file extension

    const imageSplit = image.split("\.");
    const extension = imageSplit[1];

    //delete the uploaded file

    if (extension != "png" && extension != "jpg" && extension != "jpeg" && extension != "gif") {

        const filePath = req.file.path;

        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        return res.status(400).send({

            status: "Error",
            message: "Wrong extension for image"

        });

    }

    try {
        //save file
        const newUserImage = await User.findByIdAndUpdate(req.user.id, { image: req.file.filename }, { new: true });

        console.log(newUserImage);

        if (!newUserImage) {

            return res.status(404).send({

                status: "Error",
                message: "No user found by that id"

            });

        }

        //return
        return res.status(200).send({

            status: "success",
            file: req.file,
            user: req.user,
            newUserImage

        });

    } catch (error) {

        return res.status(500).send({

            status: "Error",
            message: "An Error has occurred in the upload of the file"

        });

    }

}

//upload user avatar
const avatar = async (req, res) => {

    //get the paramas

    const file = req.params.file;

    //upload the real path of the image

    const filePath = "./uploads/avatars/" + file;

    //check if exist

    try {

        const searchedFile = await fs.statSync(filePath);

        if (!searchedFile) {

            return res.status(404).send({

                status: "Error",
                message: "The avatar does not exists"

            });

        }

        //return 

        return res.sendFile(path.resolve(filePath));

    } catch (error) {
        return res.status(500).send({

            status: "Error",
            message: "An error has occurred"

        });
    }

}

//counter
const counters = async (req, res) => {

    let userId = req.user.id;
    if (req.params.id) userId = req.params.id;

    try {
        const following = await Follow.countDocuments({ "user": userId });
        const followed = await Follow.countDocuments({ "followed": userId });
        const posts = await Publication.countDocuments({ "user": userId });
        return res.status(200).send({

            userId,
            following: following,
            followed: followed,
            posts: posts

        });

    } catch (error) {
        console.log(error)
        return res.status(200).send({

            status: "error",
            message: "An error has occurred"

        });

    }

}

module.exports = {

    userTest,
    register,
    login,
    profile,
    list,
    update,
    upload,
    avatar,
    counters

}