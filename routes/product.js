const express = require("express");
const { testProduct, addProduct, getAllProduct, adminGetAllProduct, adminGetSingleProduct } = require("../controller/productController");
const { isLoggedIn, customRole } = require("../middleware/user");

const router = express.Router()


// user routes
router.route("/products").get( getAllProduct)




// admin route
router.route("/admin/product/add").post(isLoggedIn, customRole("admin") , addProduct)
router.route("/admin/products").get(isLoggedIn, customRole("admin") , adminGetAllProduct)
router.route("/admin/product/:id").get(isLoggedIn, customRole("admin") , adminGetSingleProduct)





module.exports = router;