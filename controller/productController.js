const Product = require("../models/product");
const BigPromise = require("../middleware/BigPromise");
const CustomError = require("../utils/customError");
const WhereClause = require("../utils/whereClause");
const cloudinary = require("cloudinary").v2;

exports.addProduct = BigPromise(async (req, res, next) => {
  // images

  let imageArray = [];

  if (!req.files) {
    return next(new CustomError("Images are required", 401));
  }

  console.log(req.files.photos);
  if (req.files) {
    for (let index = 0; index < req.files.photos.length; index++) {
      let result = await cloudinary.uploader.upload(
        req.files.photos[index].tempFilePath,
        {
          folder: "products",
        }
      );
      imageArray.push({
        id: result.public_id,
        secure_url: result.secure_url,
      });
    }
  }

  req.body.photos = imageArray;
  req.body.user = req.user.id;

  const product = await Product.create(req.body);

  res.status(200).json({
    success: true,
    product,
  });
});

exports.getAllProduct = BigPromise(async (req, res, next) => {
  const resultPerPage = 6;
  const totalProductCount = await Product.countDocuments;

  const productsObj = new WhereClause(Product.find(), req.query)
    .search()
    .filter();

  let products = productsObj.base.clone();

  const filteredProductNumber = products.length;

  productsObj.pager(resultPerPage);
  products = await productsObj.base;

  res.status(200).json({
    success: true,
    products,
    filteredProductNumber,
    totalProductCount,
  });
});

exports.adminGetAllProduct = BigPromise(async (req, res, next) => {
  const products = await Product.find();

  res.status(200).json({
    succes: true,
    products,
  });
});

exports.adminGetSingleProduct = BigPromise(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return next(new CustomError("No product found with this id", 401));
  }
  res.status(200).json({
    succes: true,
    product,
  });
});

exports.adminUpdateSingleProduct = BigPromise(async (req, res, next) => {
  let product = await Product.findById(req.params.id);

  if (!product) {
    return next(new CustomError("No product found with this id. ", 401));
  }

  let imageArray = [];
  if (req.files) {
    // destroy the exiting images
    for (let index = 0; index < product.photos.length; index++) {
      const res = await cloudinary.uploader.destroy(product.photos[index].id);
    }
  }
  // upload the image

  if (!req.files) {
    return next(new CustomError("Images are required", 401));
  }

  for (let index = 0; index < req.files.photos.length; index++) {
    let result = await cloudinary.uploader.upload(
      req.files.photos[index].tempFilePath,
      {
        folder: "products",
      }
    );
    imageArray.push({
      id: result.public_id,
      secure_url: result.secure_url,
    });
  }

  req.body.photos = imageArray;

  const productId = req.params.id;
  product = await Product.findByIdAndUpdate(productId, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    succes: true,
    product,
  });
});

exports.adminDeleteSingleProduct = BigPromise(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new CustomError("No product found with this id. ", 401));
  }

  let imageArray = [];
  if (req.files) {
    // destroy the exiting images
    for (let index = 0; index < product.photos.length; index++) {
      const res = await cloudinary.uploader.destroy(product.photos[index].id);
    }
  }

  await product.deleteOne();

  res.status(200).json({
    succes: true,
    product,
  });
});
