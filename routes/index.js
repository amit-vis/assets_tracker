const express = require("express");
const router = express.Router();
const assetsController = require("../controller/asset_controller");
const { getRequests } = require("../controller/request_controller");

router.use("/auth", require("./user"));
router.use("/assets", require("./assets"));
router.use("/requets", require("./request"));
router.get("/users/:id/assests", assetsController.usersAssestsById);
router.get("/marketplace/assets", assetsController.getAssetsOnMarketPlace);
router.get("/users/:id/requests", getRequests)

module.exports = router;