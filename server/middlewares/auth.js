import jwt from "jsonwebtoken";
import UserCollection from "../models/userSchema.js";

export const auth = async (req, res, next) => {
  try {
    const token = req.headers.token;

    const payload = jwt.verify(token, process.env.JWT_SECRET);

    const user = await UserCollection.findById(payload.id);

    if (!user) {
      return res.status(401).json({ success: false, data: "unauthorized" });
    }

    const { _id, firstName, lastName, email } = user;
    req.user = {
      _id,
      firstName,
      lastName,
      email,
    };

    next();
  } catch (error) {
    res.status(500).json({ success: false, message: "Unauthorized" });
  }
};
