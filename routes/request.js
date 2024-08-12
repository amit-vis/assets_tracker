const express = require("express");
const router = express.Router();
const requestController = require("../controller/request_controller");
const passport = require("passport");

router.put("/:id/negotiate", passport.authenticate("jwt", {session: false}), requestController.negotiation);
router.put("/:id/accept", passport.authenticate("jwt", {session: false}), requestController.acceptPrice);
router.put("/:id/deny", passport.authenticate("jwt", {session: false}), requestController.denyPurchaseRequest);


module.exports = router;