import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    contant:{
        type:String,
        required:true
    },
    senderId:{
        type:mongoose.Schema.Types.ObjectId
        ,ref:"user"
    },
    resiverId:{
        type:mongoose.Schema.Types.ObjectId
        ,ref:"user"
        ,required:true
    },



},{
    timestamps:true
})

const messageModel = mongoose.model("message",messageSchema)

export default messageModel;