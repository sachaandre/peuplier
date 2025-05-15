const express = require("express");
const router = express.Router();
const requireAuth = require('../middlewares/ensureAuthenticated')

const testimony_controller = require("../controllers/testimonyController");

router.get("/temoignages", requireAuth, testimony_controller.testimony_index);

router.get("/testimony/:id", requireAuth, testimony_controller.testimony_detail);
router.post("/testimony/:id/delete", requireAuth, testimony_controller.testimony_delete_post);
router.post("/testimony/:id/archive", requireAuth, testimony_controller.testimony_archive_post);
router.post("/testimony/:id/draft", requireAuth, testimony_controller.testimony_draft_post);
router.post("/testimony/:id/publish", requireAuth, testimony_controller.testimony_publish_post);



router.get("/temoigner", testimony_controller.testimony_create_get);
router.post("/temoigner", testimony_controller.testimony_create_post);

module.exports = router;