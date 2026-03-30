import express from "express"
import * as messageService from "./message.service.js"
import { allowedFileFormates, localUpload } from "../../Common/Services/Multer/multer.confing.js"
import { notFoundExpention, succsesResponse } from "../../Common/Response/response.js"
import { auth } from "../../Middleware/auth.middleware.js"
import { validation } from "../../Middleware/validation.middleware.js"
import { deleteMessageByIdSchema, getMessageByIdSchema, sendMessageSchema } from "./message.validation.js"


const messageRouter = express.Router({caseSensitive:false})

messageRouter.post("/:receiverId", (req, res, next) => {

    const { authorization } = req.headers

    if (authorization) {
        // const authMiddleware =  auth()
        // return authMiddleware(req,res,next)
        return auth()(req, res, next)
    }


    next()
},
    localUpload(
        {
            folderName: "messages"
            , allowedFormates: [...allowedFileFormates.img, ...allowedFileFormates.video],
            fileSize: 50
        }).array("attachments", 5),
    validation(sendMessageSchema),
    async (req, res, next) => {
        if (!req.body && !req.files) {

            return notFoundExpention("you need to send a content or file at list")

        }
        await messageService.sendMessage(req.params.receiverId, req.body.content, req.files, req.user?._id)
        return succsesResponse({ res })
    })

messageRouter.get("/get/:messageId", auth(),
    validation(getMessageByIdSchema),
    async (req, res, next) => {

        const msg = await messageService.getMesgById(req.user, req.params.messageId)
        return succsesResponse({ res, data: msg })
    })

messageRouter.get("/getAllMsg", auth(), async (req, res, next) => {

    const msg = await messageService.getAllMessages(req.user._id)
    return succsesResponse({ res, data: msg })
})
messageRouter.delete("/deleteMsgById/:messageId", auth(), validation(deleteMessageByIdSchema), async (req, res, next) => {

    const msg = await messageService.deleteMessage(req.user, req.params.messageId)
    return succsesResponse({ res, data: msg })
})


export default messageRouter

