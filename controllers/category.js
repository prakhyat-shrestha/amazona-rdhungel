const formidable = require("formidable")
const _ = require("lodash")
const fs = require("fs")
const slugify = require("slugify")
const Category = require("../models/category")
const Product = require("../models/product")
const { errorHandler } = require("../helpers/dbErrorHandler")

// S2
exports.categoryById = (req, res, next, id) => {
  Category.findById(id).exec((err, category) => {
    if (err || !category) {
      return res.status(400).json({
        error: "Category does not exist",
      })
    }
    req.category = category
    next()
  })
}

// S1
// exports.create = (req, res) => {
//   const category = new Category(req.body)
//   category.save((err, data) => {
//     if (err) {
//       return res.status(400).json({
//         error: errorHandler(err),
//       })
//     }
//     res.json({ data })
//   })
// }

// S1
exports.create = (req, res) => {
  let form = new formidable.IncomingForm()
  form.keepExtensions = true
  form.parse(req, (err, fields, files) => {
    if (err) {
      return res.status(400).json({
        error: "Image could not be uploaded",
      })
    }
    // check for all fields
    const { name } = fields

    if (!name) {
      return res.status(400).json({
        error: "All fields are required",
      })
    }

    let category = new Category(fields)

    category.slug = slugify(name)

    // 1kb = 1000
    // 1mb = 1000000

    if (files.photo) {
      // console.log("FILES PHOTO: ", files.photo);
      if (files.photo.size > 1000000) {
        return res.status(400).json({
          error: "Image should be less than 1mb in size",
        })
      }

      category.photo.data = fs.readFileSync(files.photo.path)
      category.photo.contentType = files.photo.type
    }

    category.save((err, result) => {
      if (err) {
        console.log("CATEGORY CREATE ERROR ", err)
        return res.status(400).json({
          error: errorHandler(err),
        })
      }
      res.json(result)
    })
  })
}

// S3
// exports.read = (req, res) => {
//   return res.json(req.category)
// }

// S3
exports.read = (req, res) => {
  req.category.photo = undefined
  return res.json(req.category)
}

// // S4
// exports.update = (req, res) => {
//   console.log("req.body", req.body)
//   console.log("category update param", req.params.categoryId)

//   const category = req.category
//   category.name = req.body.name
//   category.save((err, data) => {
//     if (err) {
//       return res.status(400).json({
//         error: errorHandler(err),
//       })
//     }
//     res.json(data)
//   })
// }

// S5
exports.update = (req, res) => {
  let form = new formidable.IncomingForm()
  form.keepExtensions = true
  form.parse(req, (err, fields, files) => {
    if (err) {
      return res.status(400).json({
        error: "Image could not be uploaded",
      })
    }

    const { name } = fields

    // console.log("testting name", name)

    if (name) {
      category.slug = slugify(name)
    }

    let category = req.category

    category = _.extend(category, fields)

    // 1kb = 1000
    // 1mb = 1000000

    if (files.photo) {
      // console.log("FILES PHOTO: ", files.photo);
      if (files.photo.size > 1000000) {
        return res.status(400).json({
          error: "Image should be less than 1mb in size",
        })
      }
      category.photo.data = fs.readFileSync(files.photo.path)
      category.photo.contentType = files.photo.type
    }

    category.save((err, result) => {
      if (err) {
        return res.status(400).json({
          error: errorHandler(err),
        })
      }
      res.json(result)
    })
  })
}

// S5
exports.remove = (req, res) => {
  const category = req.category
  Product.find({ category }).exec((err, data) => {
    if (data.length >= 1) {
      return res.status(400).json({
        message: `Sorry. You cant delete ${category.name}. It has ${data.length} associated products.`,
      })
    } else {
      category.remove((err, data) => {
        if (err) {
          return res.status(400).json({
            error: errorHandler(err),
          })
        }
        res.json({
          message: "Category deleted",
        })
      })
    }
  })
}

// S6
exports.list = (req, res) => {
  Category.find()
    .select("-photo")
    .exec((err, data) => {
      if (err) {
        return res.status(400).json({
          error: errorHandler(err),
        })
      }
      res.json(data)
    })
}

// S10
exports.photo = (req, res, next) => {
  if (req.category.photo.data) {
    res.set("Content-Type", req.category.photo.contentType)
    return res.send(req.category.photo.data)
  }
  next()
}
