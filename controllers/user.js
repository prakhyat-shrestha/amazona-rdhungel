const User = require("../models/user")
const { Order } = require("../models/order")
const { errorHandler } = require("../helpers/dbErrorHandler")

// S1
exports.userById = (req, res, next, id) => {
  User.findById(id).exec((err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: "User not found",
      })
    }
    req.profile = user
    next()
  })
}

// S2
exports.read = (req, res) => {
  req.profile.hashed_password = undefined
  req.profile.salt = undefined
  return res.json(req.profile)
}

// S3
exports.update = (req, res) => {
  // console.log('UPDATE USER - req.user', req.user, 'UPDATE DATA', req.body);
  const { name, password } = req.body

  User.findOne({ _id: req.profile._id }, (err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: "User not found",
      })
    }
    if (!name) {
      return res.status(400).json({
        error: "Name is required",
      })
    } else {
      user.name = name
    }

    if (password) {
      if (password.length < 6) {
        return res.status(400).json({
          error: "Password should be min 6 characters long",
        })
      } else {
        user.password = password
      }
    }

    user.save((err, updatedUser) => {
      if (err) {
        console.log("USER UPDATE ERROR", err)
        return res.status(400).json({
          error: "User update failed",
        })
      }
      updatedUser.hashed_password = undefined
      updatedUser.salt = undefined
      res.json(updatedUser)
    })
  })
}

//s4
exports.addOrderToUserHistory = (req, res, next) => {
  let history = []

  req.body.order.products.forEach((item) => {
    history.push({
      _id: item._id,
      name: item.name,
      description: item.description,
      category: item.category,
      quantity: item.count,
      //transaction_id: req.body.order.transaction_id,
      amount: req.body.order.amount,
    })
  })

  User.findOneAndUpdate(
    { _id: req.profile._id },
    { $push: { history: history } },
    { new: true },
    (error, data) => {
      if (error) {
        return res.status(400).json({
          error: "Could not update user purchase history",
        })
      }
      next()
    }
  )
}

exports.purchaseHistory = (req, res) => {
  Order.find({ user: req.profile._id })
    .populate("user", "_id name")
    .sort("-created")
    .exec((err, orders) => {
      if (err) {
        return res.status(400).json({
          error: errorHandler(err),
        })
      }
      res.json(orders)
    })
}

// addToWishlist wishlist removeFromWishlist
exports.addToWishlist = (req, res) => {
  const { productId } = req.body

  console.log("reqqq", req.profile)
  console.log("got product id", productId)

  const user = User.findOneAndUpdate(
    { email: req.profile.email },
    { $addToSet: { wishlist: productId } }
  ).exec()

  res.json({ ok: true })
}

exports.wishlist = async (req, res) => {
  const list = await User.findOne({ email: req.profile.email })
    .select("wishlist")
    .populate("wishlist")
    .exec()

  console.log("liiiiiiiiiiiist", list)

  res.json(list)
}

exports.removeFromWishlist = async (req, res) => {
  const { productId } = req.params
  const user = await User.findOneAndUpdate(
    { email: req.profile.email },
    { $pull: { wishlist: productId } }
  ).exec()

  res.json({ ok: true })
}
