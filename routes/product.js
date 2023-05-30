const express = require("express");
const {
  addProduct,
  getAllProduct,
  adminGetAllProduct,
  adminGetSingleProduct,
  adminUpdateSingleProduct,
  adminDeleteSingleProduct,
} = require("../controller/productController");
const { isLoggedIn, customRole } = require("../middleware/user");

const router = express.Router();

// test product

// user routes
router.route("/products").get(getAllProduct);

// admin route
// router.route("/admin/product/add").post(isLoggedIn, addProduct)
router
  .route("/admin/product/add")
  .post(isLoggedIn, customRole("admin"), addProduct);
router
  .route("/admin/products")
  .get(isLoggedIn, customRole("admin"), adminGetAllProduct);
router
  .route("/admin/product/:id")
  .get(isLoggedIn, customRole("admin"), adminGetSingleProduct);

router
  .route("/admin/product/:id")
  .delete(isLoggedIn, customRole("admin"), adminDeleteSingleProduct)
  .put(isLoggedIn, customRole("admin"), adminUpdateSingleProduct)

module.exports = router;
