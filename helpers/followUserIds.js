const Follow = require("../models/follows");

const followUserIds = async (identityUserId) => {

    try {
        //get the following data
        let following = await Follow.find({ "user": identityUserId }).select({ "followed": 1, "_id": 0 });

        let followers = await Follow.find({ "followed": identityUserId }).select({ "user": 1, "_id": 0 });

        //process the data
        let followingClean = [];

        following.forEach(follow => {

            followingClean.push(follow.followed);

        });

        let followersClean = [];

        followers.forEach(follow => {

            followersClean.push(follow.user);

        });

        return {

            following: followingClean,
            followers: followersClean

        }


    } catch (error) {

        throw new Error("An error has occurred while making the request");

    }

}

const profileData = async (identityUserId, profileUserId) => {

    try {
        
        let following = await Follow.findOne({ "user": identityUserId, "followed": profileUserId });

        let followers = await Follow.findOne({ "user": profileUserId, "followed": identityUserId });

        return{

            following,
            followers

        }

    } catch (error) {
        
        throw new Error("An error has occurred while making the request");

    }

}

module.exports = {

    followUserIds,
    profileData

}