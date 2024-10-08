const User = require("../models/user.model");

exports.getUserProfile = async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await User.findById(userId);
    if (user.length === 0) return res.status(404).send("User not found.");

    res.status(200).send(user);
  } catch (error) {
    res.status(500).send({ error: "Error fetching user profile." });
  }
};

exports.getProducts = async (req, res) => {
  try {
    const products = await User.getAllProducts();
    if (!products || products.length === 0) {
      return res.status(404).send({ message: "No products found." });
    }
    res.status(200).send({ success: true, products });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).send({ success: false, error: "Error fetching products." });
  }
};

exports.getProductReview = async (req, res) => {
  const { id } = req.body;
  try {
    const review = await User.productReview(id);
    if (!review || review.length === 0) {
      return res.status(404).send({ message: "No review found." });
    }
    res.status(200).send({ success: true, review });
  } catch (error) {
    console.error("Error fetching review:", error);
    res.status(500).send({ success: false, error: "Error fetching review." });
  }
};

exports.editProfileinfo = async (req, res) => {
  const { info } = req.body;
  try {
    const result = await User.editProfileinfo(info);
    if (!result || result.length === 0) {
      return res.status(404).send({ message: "No Profile found." });
    }
    res.status(200).send({ success: true, result });
  } catch (error) {
    console.error("Error Profile Update:", error);
    res.status(500).send({ success: false, error: "Error Profile Update." });
  }
};

exports.changePassword = async (req, res) => {
  const { info } = req.body;
  try {
    const result = await User.passwordChange(info);
    if (!result || result.length === 0) {
      return res.status(404).send({ message: "No User Profile found." });
    }
    res.status(200).send({ success: true, result });
  } catch (error) {
    console.error("Error Password Update:", error);
    res.status(500).send({ success: false, error: "Error Password Update." });
  }
};

exports.sendOTP = async (req, res) => {
  const { email, firstname, lastname } = req.body;
  try {
    const result = await User.sendOTPmail(email, firstname, lastname);
    if (!result || result.length === 0) {
      return res.status(404).send({ message: "Error send OTP." });
    }
    res.status(200).send(result);
  } catch (error) {
    console.error("Error send OTP:", error);
    res.status(500).send({ success: false, error: "Error send OTP." });
  }
};

exports.verifyOTP = (req, res) => {
  const { email, otp } = req.body;

  try {
    const result = User.verifyOtp(email, otp);

    if (!result.success) {
      return res.status(202).send(result);
    }

    res.status(200).send(result);
  } catch (error) {
    console.error("Error verify OTP:", error);
    res.status(500).send({
      success: false,
      error: "Internal server error while verifying OTP.",
    });
  }
};
