const Product = require("../models/product");
const BigPromise = require("../middleware/BigPromise");
const CustomError = require("../utils/customError");
const WhereClause = require("../utils/whereClause");
const cloudinary = require("cloudinary").v2;

exports.addProduct = BigPromise(async (req, res, next) => {
  // images
  let imageArray = [];

  if (!req.files) {
    return next(new CustomError(`Images are required`, 401));
  }

  if (req.files) {
    for (let index = 0; index < req.files.photos.length; index++) {
      let result = await cloudinary.uploader.upload(
        req.files.photos[index].tempFilePath,
        {
          folder: "Products",
        }
      );

      imageArray.push({
        id: result.public_id,
        url: result.secure_url,
      });
    }
  }

  req.body.photos = imageArray;

  req.body.user = req.user.id;
  console.log(req.body.user);
//   console.log(req.user.id , 'body suer ');
// console.log(req.user.id, 'user');

  const product = await Product.create(req.body);

  res.status(200).json({
    success: true,
    product,
  });
});
