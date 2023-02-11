const express = require("express");
const userRouter = express.Router();
const {
  registrationController,
  loginController,
  logoutController,
  getCurrentUserController,
  avatarController,
} = require("../../controllers/userControllers");
const { authMiddleware } = require("../../middleware/authMiddleware.js");
const { uploadAvatar } = require("../../middleware/avatarsMiddleware");
const { userValidation } = require("../../middleware/middleware");
// const { avatar } = require("../../services/authService");
const tryCatch = require("../../utils/try-catch.utils");


userRouter
  .post("/register", userValidation, tryCatch(registrationController))
  .get("/login", userValidation, tryCatch(loginController))
  .post("/logout", authMiddleware, tryCatch(logoutController))
  .get("/current", authMiddleware, tryCatch(getCurrentUserController))
  .patch(
    "/avatars",
    authMiddleware,
    uploadAvatar.single("avatar"),
    tryCatch(avatarController)
  ); 

module.exports = userRouter;
