const express = require("express")
const router = express.Router()

// middlewares

const { requireSignin, isAuth, isAdmin } = require("../controllers/auth")
const { userById } = require("../controllers/user")

// controller
const { create, read, update, remove, list } = require("../controllers/sub")

router.post("/sub/create/:userId", requireSignin, isAuth, isAdmin, create)
router.get("/sub/:slug", read)

router.put("/sub/:slug/:userId", requireSignin, isAuth, isAdmin, update)

router.delete("/sub/:slug/:userId", requireSignin, isAuth, isAdmin, remove)

router.get("/subs", list)

router.param("userId", userById)
module.exports = router
