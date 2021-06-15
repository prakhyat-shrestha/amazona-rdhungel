const express = require("express");
const router = express.Router();

const { requireSignin, isAuth } = require("../controllers/auth");

const { userById, read, update } = require("../controllers/user");

router.get("/secret/:userId", requireSignin, (req, res) => {
  res.json({
    user: req.profile,
  });
});

router.get("/user/:userId", requireSignin, isAuth, read);
router.put("/user/:userId", requireSignin, isAuth, update);

router.param("userId", userById);

module.exports = router;
