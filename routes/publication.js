const express = require("express");
const router = express.Router();
const PublicationController = require("../controllers/publication");
const check = require("../middlewares/auth");
const multer = require("multer");
const path = require("path");

//multer
const storage = multer.diskStorage({

    destination: function(req, file, cb){

        cb(null, "./uploads/posts/")

    },

    filename:  function(req, file, cb){
        cb(null, "post-" + Date.now() +"-"+path.extname(file.originalname));

    }

});

const uploads = multer({storage: storage});

//routes
router.get("/publication-test", PublicationController.publicationTest);
router.post("/save", check.auth, PublicationController.save);
router.get("/detail/:id", check.auth, PublicationController.onePost);
router.delete("/delete/:id", check.auth, PublicationController.deletePost);
router.get("/user/:id/:page?", check.auth, PublicationController.user);
router.post("/upload/:id", [check.auth, uploads.single("file0")], PublicationController.upload);
router.get("/media/:file", PublicationController.media);
router.get("/feed/:page?", check.auth, PublicationController.feed);

module.exports = router;