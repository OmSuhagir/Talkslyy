import FriendRequest from "../models/FriendRequest.js";
import User from "../models/User.js";

export async function getRecommendedUser(req, res) {
    try {
        const currentUserId = req.user.id;
        const currentUser = req.user;

        const recommendedUsers = await User.find({
            $and: [
                { _id: { $ne: currentUserId } },
                { _id: { $nin: currentUser.friends } },
                { isOnboarded: true }
            ]
        })

        res.status(200).json(recommendedUsers);
    } catch (error) {
        console.log("Error in RecommnendedUser Controller: ", error.message);
        res.status(500).jasn({ message: "Internal Server error" })
    }
}

export async function getMyFriends(req, res) {
    try {
        const user = await User.findById(req.user.id)
            .select("friends")
            .populate("friends", "fullName profilePic nativeLanguage learningLanguage");

            res.status(200).json(user.friends)
    } catch (err) {
        console.log("Error in getMyFriends controller: ", err.message);
        res.status(500).json({message: "Internal Server Error"});
    }
}

export async function sendFriendRequest(req, res) {
    try {
        const myId = req.user.id;
        const {id:recipientId} = req.params;

        if(myId === recipientId) {
            return res.status(400).json({message: "You cant send request to yourself"})
        }

        const recipient = await User.findById(recipientId)
        if(!recipient) {
            return res.status(404).json({message: "Recipient not found"})
        }

        if(recipient.friends.includes(myId)) {
            return res.status(400).json({message: "You are already friends with this user"});
        }

        const existingRequest = await FriendRequest.findOne({
            $or:[
                {sender:myId, recipient:recipientId},
                {sender:recipientId, recipient:myId},
            ]
        })
        if(existingRequest) {
            return res.status(400).json({message: "A friend request already exist between you and this user"});
        }

        const friendRequest = await FriendRequest.create({
            sender: myId,
            recipient: recipientId 
        })

        res.status(201).json(friendRequest)

    } catch (error) {
        console.error("Error in sendFriendRequest controller: ", error.message);
        res.status(500).json({message: "Internal server error"});
    }
}

export async function acceptFriendRequest(req, res) {
    try {
        const {id:requestId} = req.params;
        const friendRequest = await FriendRequest.findById(requestId);

        if(!friendRequest) {
            return res.status(404).json({message:"Request Not found"});
        }

        if(friendRequest.recipient.toString() != req.user.id)  {
            return res.status(404).json({message:"You are not authorized to accept trhe request"});
        }

        friendRequest.status = "accepted";
        await friendRequest.save();

        // Add to the friends array
        await User.findByIdAndUpdate(friendRequest.sender, {
            $addToSet: {friends: friendRequest.recipient},
        });

        await User.findByIdAndUpdate(friendRequest.recipient, {
            $addToSet: {friends: friendRequest.sender},
        });

        res.status(200).json({message: "Request Accepted Successfully"})

    } catch (error) {
        console.log("Error in acceptRequest controller.", error.message);
        res.status(500).json({message:"Internal server error"})
    }
}

export async function getFriendRequests(req, res) {
    try {
        const incomingRequests = await FriendRequest.find({
            recipient: req.user.id,
            status: "pending",
        }).populate("sender","fullName profilePic nativeLanguage learningLanguage");

        const acceptedRequests = await FriendRequest.find({
            sender: req.user.id,
            status:"accepted",     
        }).populate("recipient", "fullName profilePic");

        res.status(200).json({incomingRequests, acceptedRequests})
    } catch (error) {
        console.log("Error in getFriendRequests controller.", error.message);
        res.status(500).json({message:"Internal server error"})
    }
}

export async function getOutgoingFriendRequest(req, res) {
    try {
        const outgoingRequests = await FriendRequest.find({
            sender: req.user.id,
            status: "pending"
        }).populate("recipient", "fullName profilePic nativeLanguage learningLanguage")

     res.status(200).json(outgoingRequests)
    } catch (error) {
        console.log("Error in getOutgoingFriendRequest controller.", error.message);
        res.status(500).json({message:"Internal server error"})
    }
}
