import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    content:{
        type:String,
        required:function(){
            return !this.attachments.length;
        }
    },
    attachments:{
        type:[String]
    },
    senderId:{
        type:mongoose.Schema.Types.ObjectId
        ,ref:"user"
    },
    receiverId:{
        type:mongoose.Schema.Types.ObjectId
        ,ref:"user"
        ,required:true
    },
},{
    timestamps:true
})



const messageModel = mongoose.model("message",messageSchema)

export default messageModel;