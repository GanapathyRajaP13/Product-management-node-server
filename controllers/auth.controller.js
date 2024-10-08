const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const {
  createUser,
  findByUsername,
  findUser,
  findUrls,
} = require("../models/user.model");
const {
  createRefreshToken,
  findByToken,
  deleteByToken,
} = require("../models/refreshToken.model");

const generateAccessToken = (user) => {
  return jwt.sign(user, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRATION,
  });
};

exports.register = async (req, res) => {
  try {
    const { username, password, firstName, lastName, gender, email } = req.body;

    const existingUser = await findByUsername(username);
    if (existingUser.length > 0) {
      return res
        .status(202)
        .json({ success: false, message: "Username already exists." });
    }

    const hashedPassword = bcrypt.hashSync(password, 8);
    await createUser({
      username,
      password: hashedPassword,
      firstName,
      lastName,
      gender,
      email,
    });

    res
      .status(201)
      .send({ success: true, message: "User registered successfully!" });
  } catch (error) {
    res.status(500).send({ error: "Error registering user." });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password, role } = req.body;
    const users = await findUser(username, role);

    if (users.length === 0)
      return res.status(404).send({ auth: false, status: "No user found." });

    const user = users[0];
    const passwordIsValid = bcrypt.compareSync(password, user.password);

    if (!passwordIsValid)
      return res
        .status(401)
        .send({ auth: false, status: "Invalid credentials" });

    const accessToken = generateAccessToken({
      id: user.id,
      username: user.username,
    });
    const refreshToken = await createRefreshToken(user.id);
    const userURL = await findUrls(user.UserType);
    const { password: userPassword, ...userData } = user;
    res
      .status(200)
      .send({ auth: true, accessToken, refreshToken, userData, userURL });
  } catch (error) {
    res.status(500).send({ error: "Error during login." });
  }
};

exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).send("Refresh Token required.");
    const tokens = await findByToken(refreshToken);
    if (tokens.length === 0) {
      return res.status(403).send("Invalid refresh token.");
    }

    const tokenRecord = tokens[0];
    const accessToken = generateAccessToken({ id: tokenRecord.user_id });
    await deleteByToken(refreshToken);
    const newRefreshToken = await createRefreshToken(tokenRecord.user_id);

    res.status(200).send({
      accessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    console.error("Error refreshing token:", error);
    res.status(500).send({ error: "Error refreshing token." });
  }
};

exports.logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) return res.status(401).send("Refresh Token required.");

    await deleteByToken(refreshToken);
    res.status(200).send("Logged out successfully.");
  } catch (error) {
    res.status(500).send({ error: "Error logging out." });
  }
};
