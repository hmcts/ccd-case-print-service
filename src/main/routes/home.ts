import * as express from "express";

const router = express.Router();

/* GET home page. */
router.get("/", (req, res) => {
  res.render("home");
});

export default router;
