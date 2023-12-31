import UserCollection from "../models/userSchema.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
    generateResetToken,
    sendPasswordResetEmail,
} from "../utils/resetPassword.js";

export const registerUser = async (req, res) => {
    try {
        const user = new UserCollection(req.body);
        const hashedPassword = bcrypt.hashSync(user.password, 10);
        user.password = hashedPassword;
        await user.save();
        res.status(201).json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await UserCollection.findOne({ email }).populate([
          {
            path: "image",
            model: "Image",
          },
          {
            path: "friends",
            model: "User",
            populate: {
              path: "image",
              model: "Image",
            },
          },
        ]);
        if (user) {
            const verifyPassword = bcrypt.compareSync(password, user.password);
            if (verifyPassword) {
                const token = jwt.sign(
                    { id: user._id, email: user.email },
                    process.env.JWT_SECRET,
                    { expiresIn: "1h" }
                );
                res.header("token", token).json({ success: true, data: user });
            } else {
                res.status(403).json({
                    success: false,
                    message: "Invalid password",
                });
            }
        } else {
            res.status(403).json({ success: false, message: "Invalid email" });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getAllUsers = async (req, res) => {
    try {
        const users = await UserCollection.find();
        res.status(200).json({ success: true, data: users });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const refreshPage = async (req, res) => {
    res.json({ success: true, data: req.user });
};

export const getSingleUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await UserCollection.findById(id).populate([
            {
                path: "image",
                model: "Image",
            },
            {
                path: "friends",
                model: "User",
                populate: {
                    path: "image",
                    model: "Image",
                },
            },
        ]);
        if (user) {
            res.status(200).json({ success: true, data: user });
        } else {
            res.status(404).json({ success: false, message: "User not found" });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            image,
            firstName,
            lastName,
            occupation,
            location,
            birthday,
            mobile,
        } = req.body;

        const updateUser = await UserCollection.findByIdAndUpdate(
          id,
          {
            image,
            firstName,
            lastName,
            occupation,
            location,
            birthday,
            mobile,
          },
          {
            new: true,
          }
        ).populate([
          {
            path: "image",
            model: "Image",
          },
          {
            path: "friends",
            model: "User",
            populate: {
              path: "image",
              model: "Image",
            },
          },
        ]);

        res.status(200).json({ success: true, data: updateUser });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedUser = await UserCollection.findByIdAndDelete(id);
        res.status(200).json({ success: true, data: deletedUser });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const addFriend = async (req, res) => {
    try {
        const { id } = req.params;
        const { friendId } = req.body;
        const user = await UserCollection.findById(id);
        if (!user) {
            res.status(404).json({ success: false, message: "User not found" });
        } else {
            const friend = await UserCollection.findById(friendId);
            if (!friend) {
                res.status(404).json({
                    success: false,
                    message: "Friend not found",
                });
            } else {
                const isFriend = user.friends.includes(friendId);
                if (isFriend) {
                    res.status(400).json({
                        success: false,
                        message: "Friend already added",
                    });
                } else {
                    user.friends.push(friendId);
                    const updatedUser = await user.save();
                    const populatedUser = await UserCollection.findById(
                        updatedUser._id
                    ).populate([
                        {
                            path: "image",
                            model: "Image",
                        },
                        {
                            path: "friends",
                            model: "User",
                            populate: {
                                path: "image",
                                model: "Image",
                            },
                        },
                    ]);
                    res.status(201).json({
                        success: true,

                        data: populatedUser,
                    });
                }
            }
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const removeFriend = async (req, res) => {
    try {
        const { id } = req.params;
        const { friendId } = req.body;
        const user = await UserCollection.findById(id);
        if (!user) {
            res.status(404).json({ success: false, message: "User not found" });
        } else {
            const isFriend = user.friends.includes(friendId);
            if (!isFriend) {
                res.status(400).json({
                    success: false,
                    message: "Friend not found",
                });
            } else {
                user.friends = user.friends.filter(
                    (friend) => friend.toString() !== friendId.toString()
                );
                const updatedUser = await user.save();
                const populatedUser = await UserCollection.findById(
                    updatedUser._id
                ).populate([
                    {
                        path: "image",
                        model: "Image",
                    },
                    {
                        path: "friends",
                        model: "User",
                        populate: {
                            path: "image",
                            model: "Image",
                        },
                    },
                ]);
                res.status(200).json({
                    success: true,

                    data: populatedUser,
                });
            }
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getUserFriends = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await UserCollection.findById(id).populate("friends");
        if (!user) {
            res.status(404).json({ success: false, message: "User not found" });
        } else {
            res.status(200).json({ success: true, data: user.friends });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const searchUsers = async (req, res) => {
    const { query: searchTerm } = req.body;
    try {
        const users = await UserCollection.find({
            $or: [
                { firstName: { $regex: searchTerm, $options: "i" } },
                { lastName: { $regex: searchTerm, $options: "i" } },
            ],
        }).populate("image");
        res.status(200).json({ success: true, data: users });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Controller for handling forgot password request
export const forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        // Check if the user with the provided email exists
        const user = await UserCollection.findOne({ email });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Generate a password reset token and save it to the user's document
        const resetToken = generateResetToken();
        user.resetToken = resetToken;
        user.resetTokenExpiry = Date.now() + 3600000; // Token expires in 1 hour
        await user.save();

        // Send password reset email to the user's email address
        sendPasswordResetEmail(user.email, resetToken);

        res.status(200).json({ message: "Password reset email sent" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Controller for handling password reset request
export const resetPassword = async (req, res) => {
    const { token, password } = req.body;

    try {
        // Find the user with the provided reset token
        const user = await UserCollection.findOne({
            resetToken: token,
            resetTokenExpiry: { $gt: Date.now() }, // Check if the token is not expired
        });

        if (!user) {
            return res.status(400).json({ error: "Invalid or expired token" });
        }

        // Hash the new password
        const hashedPassword = bcrypt.hashSync(password, 10);

        // Update the user's password and clear the reset token fields
        user.password = hashedPassword;
        user.resetToken = undefined;
        user.resetTokenExpiry = undefined;
        await user.save();

        res.status(200).json({ message: "Password reset successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
};
