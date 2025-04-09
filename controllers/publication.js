const Publication = require("../models/publication");
const followHelper = require("../helpers/followUserIds");
const fs = require("fs");
const path = require("path");

const publicationTest = (req, res) => {

    return res.status(200).send({

        message: "delivered from ./controllers/publication.js"

    });

}

//save post
const save = async (req, res) => {

    //get the body data

    const params = req.body;

    if (!params.text) return res.status(400).send({ status: "Error", message: "An Error has ocurred while getting the data" });

    //create the object

    let newPost = new Publication(params);
    newPost.user = req.user.id;

    //save the data

    try {
        const storedPost = await newPost.save()

        //return
        return res.status(200).send({

            status: "success",
            message: "saved post",
            storedPost

        });
    } catch (error) {
        return res.status(500).send({

            status: "Error",
            message: "An error has occurred while making the request"

        });
    }
}

//get one post
const onePost = async (req, res) => {

    //get the post id
    const postId = req.params.id;
    //find the post

    try {
        const foundPost = await Publication.findById(postId);

        //return

        return res.status(200).send({

            status: "success",
            message: "post",
            foundPost

        });

    } catch (error) {
        return res.status(200).send({

            status: "Error",
            message: "An error has occurred while making the request"

        });
    }
}

//delete post
const deletePost = async (req, res) => {

    //get the id post

    const deletedPostId = req.params.id;

    try {

        //find and delete the post

        const deletedPost = await Publication.findOneAndDelete({ "user": req.user.id, "_id": deletedPostId });

        //return

        return res.status(200).send({

            status: "success",
            message: "deleted post",
            deletedPostId

        });
    } catch (error) {

        return res.status(500).send({

            status: "Error",
            message: "An error has occurred while making the request"

        });

    }
}

//list of post by feed
const feed = async (req, res) => {

    //get the page
    let page = 1;

    if (req.params.page) page = req.params.page;

    //elements per page
    let itemsPerPage = 5;
    
    const total = await Publication.countDocuments();

    //get an array of id´s of users that I follow
    try {
        const myFollows = await followHelper.followUserIds(req.user.id);

        //find the posts in, sort, populate, paginate

        const feedPost = await Publication
        .find({user: myFollows.following})
        .sort("-created_at")
        .populate('user', '-email -password -__v -role -name -surname')
        .paginate(page, itemsPerPage);

        if(feedPost.length == 0) return res.status(200).send({ status: "succes", message: "No posts in your feed"});

        return res.status(200).send({

            status: "success",
            message: "welcome to your feed",
            myFollows: myFollows.following,
            feedPost,
            page,
            itemsPerPage,
            pages: Math.ceil(total / itemsPerPage)

        });
    } catch (error) {

        
        return res.status(500).send({

            status: "Error",
            message: "An error has occurred while making the request"

        });

    }

}

//return files
const media = async (req, res) => {

    //get the paramas

    const file = req.params.file;

    //upload the real path of the image

    const filePath = "./uploads/posts/" + file;

    //check if exist

    try {

        const searchedFile = await fs.statSync(filePath);

        if (!searchedFile) {

            return res.status(404).send({

                status: "Error",
                message: "The post does not exists"

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

//list of profile post
const user = async (req, res) => {

    //get the user id

    const userId = req.params.id;

    //handle the page numbeer

    let page = 1;

    if (req.params.page) page = req.params.page;

    const itemsPerPage = 5;

    const total = await Publication.countDocuments();

    //find, populate, sort, paginate

    try {
        const userPost = await Publication.find({ "user": userId })
            .sort("-created_at")
            .populate('user', '-email -password -__v -role -name -surname -bio')
            .paginate(page, itemsPerPage);

        if (userPost.length == 0) return res.status(400).send({ status: "error", message: "No posts in this account!" })

        //return
        return res.status(200).send({

            status: "success",
            message: "user posts",
            posts: userPost,
            page,
            itemsPerPage,
            pages: Math.ceil(total / itemsPerPage)

        });

    } catch (error) {
        return res.status(500).send({

            status: "Error",
            message: "An error has occurred while making the request."

        });
    }

}

//upload files
const upload = async (req, res) => {

    //get the file

    const postId = req.params.id;

    if (!req.file) {

        return res.status(404).send({

            status: "error",
            message: "The request needs the image"

        });

    }

    // get the file original name

    let image = req.file.originalname;
    const existingPublication = await Publication.findById(postId);
    console.log(req.user.id);
    if (!existingPublication) {
        return res.status(404).send({
            status: "error",
            message: "Publication  not found"
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
        const newPostImage = await Publication.findByIdAndUpdate({ "user": req.user.id, "_id": postId }, { file: req.file.filename }, { new: true });

        console.log(newPostImage);

        if (!newPostImage) {

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
            newPostImage

        });

    } catch (error) {

        return res.status(500).send({

            status: "Error",
            message: "An Error has occurred in the upload of the file"

        });

    }

}

module.exports = {

    publicationTest,
    save,
    onePost,
    deletePost,
    user,
    upload,
    media,
    feed

}