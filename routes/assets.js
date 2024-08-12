const express = require("express");
const router = express.Router();
const assetsController = require("../controller/asset_controller");
const requestController = require("../controller/request_controller");
const passport = require("passport");

// route for assets controller
router.post("/", passport.authenticate("jwt", {session: false}), assetsController.createAssests);
router.put("/:id",passport.authenticate("jwt", {session: false}), assetsController.updateAssest);
router.put("/:id/publish", passport.authenticate("jwt", {session: false}), assetsController.publish);
router.get("/:id", assetsController.getAssestDetails);
router.get("/getAssets", passport.authenticate("jwt", {session: false}), assetsController.usersAssests);
router.post("/:id/request", passport.authenticate("jwt", {session: false}), requestController.setProposal)


module.exports = router;