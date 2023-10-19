const { getLoginPage,getSignupPage,signup,login } = require("../controller/user");
const express = require("express");
const router = express.Router();
const { authentication } = require("../middlewares/auth");

router.route("/").get(getLoginPage);
router.route("/signup").post(signup);
router.route("/login").post(login);
router.route("/new").get(getSignupPage);


module.exports = router;
