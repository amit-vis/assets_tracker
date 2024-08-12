const express = require("express");
const router = express.Router();
const userController = require("../controller/user_controller");

router.post("/signup", userController.create);
router.post("/login", userController.signin);

module.exports = router;