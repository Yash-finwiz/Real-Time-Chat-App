const mongoose= require("mongoose");

const conversationSchema = new mongoose.Schema({
            
    participants: [
        {
            type: mongoose.Types.ObjectId,
            ref: "User"
        },
    ],
    messages: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Message",
            default: [],
        },
    ],
    isGroupChat: {
        type: Boolean,
        default: false,
    },
    groupName:{
        type: String
    },
    groupAdmin:[
        {
            type: mongoose.Types.ObjectId,
            ref: "User",
        }
    ],

    }, { timestamps: true } );

module.exports= mongoose.model("Conversation", conversationSchema);