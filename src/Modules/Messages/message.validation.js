import joi from "joi"
import { commonValditions } from "../../Middleware/validation.middleware.js"

 export const sendMessageSchema ={
    body: joi.object({}).keys({
        content :joi.string().min(3).max(10000)
    }),
    params:joi.object({}).keys({
       receiverId:commonValditions.id.required()
    }).required()
 }

 export const getMessageByIdSchema ={
    params:joi.object({}).keys({
       messageId:commonValditions.id.required()
    }).required()
 }

 export const deleteMessageByIdSchema ={
    params:joi.object({}).keys({
       messageId:commonValditions.id.required()
    }).required()
 }