const express = require("express")
const router = express.Router()

const { requireSignin, isAuth } = require("../controllers/auth")

const {
	userById,
	read,
	update,
	purchaseHistory,
	addToWishlist,
	wishlist,
} = require("../controllers/user")

router.get("/secret/:userId", requireSignin, (req, res) => {
	res.json({
		user: req.profile,
	})
})

router.get("/user/:userId", requireSignin, isAuth, read)
router.put("/user/:userId", requireSignin, isAuth, update)
router.get("/orders/by/user/:userId", requireSignin, isAuth, purchaseHistory)

// wishlist
router.post("/user/wishlist/:userId", requireSignin, isAuth, addToWishlist)
router.get("/user/wishlist/:userId", requireSignin, isAuth, wishlist)

router.param("userId", userById)

module.exports = router
