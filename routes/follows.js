const express = require("express");
const router = express.Router();
const check=require("../middlewares/auth");
const FollowsController = require("../controllers/follows");

//routes
router.get("/follows-test", FollowsController.followsTest);
router.post("/save", check.auth, FollowsController.saveFollow);
router.delete("/unFollow/:id", check.auth, FollowsController.unfollow);
router.get("/following/:id?/:page?", check.auth, FollowsController.following);
router.get("/followers/:id?/:page?", check.auth, FollowsController.followers);

module.exports = router;