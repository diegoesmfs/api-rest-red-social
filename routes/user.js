const express = require("express");
const router = express.Router();
const UserController = require("../controllers/user");
const check = require("../middlewares/auth");
const multer = require("multer");
const path = require("path");

//multer
const storage = multer.diskStorage({

    destination: function(req, file, cb){

        cb(null, "./uploads/avatars/")

    },

    filename:  function(req, file, cb){
        cb(null, "avatar-" + Date.now() +"-"+path.extname(file.originalname));

    }

});

const uploads = multer({storage: storage});

//routes
router.get("/test", check.auth, UserController.userTest);
router.get("/avatar/:file", UserController.avatar);
router.get("/profile/:id", check.auth, UserController.profile);
router.get("/list/:page?", check.auth, UserController.list);
router.post("/register", UserController.register);
router.post("/login", UserController.login);
router.post("/upload", [check.auth, uploads.single("file0")], UserController.upload);
router.put("/update", check.auth, UserController.update);
router.get("/counters/:id", check.auth, UserController.counters);

module.exports = router;