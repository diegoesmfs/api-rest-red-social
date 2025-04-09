const Follow = require("../models/follows");
const followHelper = require("../helpers/followUserIds");
const User = require("../models/user");
const mongoosePaginate = require("mongoose-pagination");

const followsTest = (req, res) => {

    return res.status(200).send({

        message: "delivered from ./controllers/follows.js"

    });

}

//follow action

const saveFollow = async (req, res) => {

    //get the body

    const parameters = req.body;
    const followedId = parameters.followed;
    console.log(followedId)

    //get id of the user to follow

    const identity = req.user;

    //make an object 

    let followedUser = new Follow({

        user: identity.id,
        followed: parameters.followed

    });

    //save the data in prometheus

    try {

        const savedFollow = await followedUser.save();

        return res.status(200).send({

            status: "success",
            message: "followed!!",
            savedFollow

        });

    } catch (error) {

        return res.status(500).send({

            status: "error",
            message: "An Error has ocurred while following the user try again"

        });

    }

}

//unfollow action

const unfollow = async (req, res) => {

    //get the id of the user
    const userId = req.user.id;

    //get the id of the unfollowed user

    const followedId = req.params.id;

    //find the user to unfollow

    try {

        const followRelation = await Follow.findOne({
            user: userId,
            followed: followedId
        });

        if (!followRelation) {
            return res.status(404).send({
                status: "error",
                message: "The follow relationship does not exist"
            });
        }

        // Eliminar la relación de seguimiento
        await Follow.deleteOne({
            user: userId,
            followed: followedId
        });

        return res.status(200).send({

            status: "success",
            message: "User unfollowed",

        })


    } catch (error) {

        return res.status(500).send({

            status: "Error",
            message: "An error has occurred while processing the request"

        });

    }

}

//follows list

const following = async (req, res) => {

    //get the user id

    const userId = req.user.id;


    //then make sure that we recive the id by the parameters

    if (req.params.id) userId = req.params.id;

    //check the page

    let page = 1;

    if (req.params.page) page = req.params.page;

    //users per page

    const itemsPerPage = 5;

    //find the follows via mongoose paginate


    try {

        const usersToFind = await Follow.find({ user: userId }).select("-email -password -__v -role -name -surname").paginate(page, itemsPerPage);

        if (!usersToFind) {

            return res.status(404).send({

                status: "Error",
                message: "No followers "

            });

        }

        const total = await Follow.countDocuments();



        //make an array of the users that follows  the user and the user watching the user profile

        let followUserIds = await followHelper.followUserIds(req.user.id);

        return res.status(200).send({

            status: "success",
            message: "following users",
            usersToFind,
            userFollowing: followUserIds,
            page,
            itemsPerPage,
            pages: Math.ceil(total / itemsPerPage)


        });

    } catch (error) {

        console.log(error)

        return res.status(500).send({

            status: "Error",
            message: "An error has occurred in the request"

        });

    }

}

//followers list

const followers = async (req, res) => {

    //get the user id

    let userId = req.user.id;

    //then make sure that we recive the id by the parameters

    if (req.params.id) userId = req.params.id;

    //check the page

    let page = 1;

    if (req.params.page) page = req.params.page;

    //users per page

    const itemsPerPage = 5;

    //find the follows via mongoose paginate


    try {
        const usersToFind = await Follow.find({ followed: userId }).select("-email -password -__v -role -name -surname").paginate(page, itemsPerPage);

        if (!usersToFind) {

            return res.status(404).send({

                status: "Error",
                message: "No followers "

            });

        }

        const total = await Follow.countDocuments();



        //make an array of the users that follows  the user and the user watching the user profile

        let followUserIds = await followHelper.followUserIds(req.user.id);

        return res.status(200).send({

            status: "success",
            message: "list of following users",
            usersToFind,
            userFollowing: followUserIds.following,
            userFollowMe: followUserIds.followers,
            page,
            itemsPerPage,
            pages: Math.ceil(total / itemsPerPage)


        });

    } catch (error) {

        console.log(error)

        return res.status(500).send({

            status: "Error",
            message: "An error has occurred in the request"

        });

    }

}

module.exports = {

    followsTest,
    saveFollow,
    unfollow,
    following,
    followers
}