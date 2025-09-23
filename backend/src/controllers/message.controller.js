import cloudinary from "../lib/cloudinary.js";
import Message from "../models/Message.js";
import User from "../models/User.js";

export const getAllContacts = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const contacts = await User.find({
      _id: { $ne: loggedInUserId },
    })
      .select("-password")
      .sort({ createdAt: -1 });
    return res.status(200).json(contacts);
  } catch (error) {
    console.error("Error fetching contacts", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getMessagesByUserId = async (req, res) => {
  try {
    const myId = req.user._id;
    const { id: userToChatId } = req.params;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    }).sort({ createdAt: -1 });

    return res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching messages by user id", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const senderId = req.user._id;
    const { id: receiverId } = req.params;
    const { text, image } = req.body;

    if (!text && !image) {
      return res.status(400).json({ message: "Text or image is required" });
    }

    if (!receiverId) {
      return res.status(400).json({ message: "Receiver ID is required" });
    }

    if (!senderId) {
      return res.status(400).json({ message: "Sender ID is required" });
    }

    if (senderId.equals(receiverId)) {
      return res
        .status(400)
        .json({ message: "Sender and receiver cannot be the same" });
    }

    const receiverExists = await User.exists({ _id: receiverId });
    if (!receiverExists) {
      return res.status(404).json({ message: "Receiver not found" });
    }

    let imageUrl;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId: senderId,
      receiverId: receiverId,
      text,
      image: imageUrl,
    });

    const message = await newMessage.save();

    return res.status(201).json(message);
  } catch (error) {
    console.error("Error sending message", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getChatPartners = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const chats = await Message.find({
      $or: [{ senderId: loggedInUserId }, { receiverId: loggedInUserId }],
    }).sort({ createdAt: -1 });

    const chatPartnerIds = chats.map((chat) => {
      if (chat.senderId.toString() === loggedInUserId.toString()) {
        return chat.receiverId;
      } else {
        return chat.senderId;
      }
    });

    const uniqueChatPartnerIds = [...new Set(chatPartnerIds)];

    const chatPartners = await User.find({
      _id: { $in: uniqueChatPartnerIds },
    })
      .select("-password")
      .sort({ createdAt: -1 });

    return res.status(200).json(chatPartners);
  } catch (error) {
    console.error("Error fetching chats", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
