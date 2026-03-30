import { badRequstExpention, notFoundExpention } from "../../Common/Response/response.js"
import * as dbRepo from "../../DB/db.repostory.js"
import messageModel from "../../DB/Models/Message.Model.js"
import userModel from "../../DB/Models/User.Model.js"



export async function sendMessage(receiverId,content,filesData,senderId) {

 const receiver =await dbRepo.findById({model:userModel,id:receiverId})

 if(!receiver){
    return badRequstExpention("reciver not found")
 }
    await dbRepo.create({model:messageModel,data:{
        content,
        attachments:filesData.map(files=> files.finalPath),
        receiverId,
        senderId
    }
    })
}


export async function getMesgById(userData,messageId) {

  const msg=  await dbRepo.findOne({model:messageModel,filters:{
        _id:messageId,
        receiverId:userData._id
    },select:"-senderId"
})

    if (!msg) {

        return notFoundExpention("invalid msg Id ")
        
    }
    return msg
}

export async function getAllMessages(userId) {
    const msg=  await dbRepo.find({model:messageModel,filters:{
      $or:[{receiverId:userId},{senderId:userId}]
    },select:"-senderId"
})
 if (!msg.length) {

        return notFoundExpention("not msg found")
        
    }
    return msg

}
export async function deleteMessage(userData,messageId) {
    const msg=  await dbRepo.deleteOne({model:messageModel,filters:{
        _id:messageId,
        receiverId:userData._id
    }
})
 if (!msg.deletedCount) {

        return notFoundExpention("not msg found")
        
    }
    return msg

}