const User = require("../models/userModel");
const { NotAuthorizedError } = require("../utils/error");
const jsonwebtoken = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const gravatar = require("gravatar");
const Jimp = require("jimp");
const path = require("path");

const registration = async (email, password) => {
  const avatarURL = gravatar.url(email);
  const user = new User({ email, password, avatarURL });
  await user.save();
  return user;
};

const login = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new NotAuthorizedError("Is not valid email");
  }
  if (!(await bcrypt.compare(password, user.password))) {
    throw new NotAuthorizedError("Password is incorrect");
  }
  const token = jsonwebtoken.sign(
    {
      id: user._id,
      email: user.email,
    },
    process.env.SECRET_JWT
  );
  return token;
};

const logout = async (id) => {
  const user = await User.findByIdAndUpdate(id, { token: null });

  if (!user) throw new NotAuthorizedError("Not authorized");
};

const getCurrentUser = async (id) => {
  const user = await User.findById(id);
  if (!user || !user.token) {
    throw new NotAuthorizedError("Not authorized");
  }
  return user;
};

const avatar = async (id, file) => {
  if (!file) {
    return Promise.reject(new Error("file not found"));
  }
  const { path: temporaryPath, originalName } = file;
  const newName = `${id}_${originalName}`;
  const avatarDir = path.resolve("./public/avatars");
  const newPath = path.join(avatarDir, newName);
  await Jimp.read(temporaryPath).then((avatar) => {
    return avatar.resize(250, 250).write(newPath);
  }).catch((err) => {
    throw err;
  });
  const avatarURL = path.join("avatars", newName);
  const updateUser = await User.findOneAndUpdate({ avatarURL }, { new: true, })
  return updateUser.avatarURL;
};


module.exports = {
  registration,
  login,
  logout,
  getCurrentUser,
  avatar,
};
