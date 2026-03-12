import { ENCRPTION_KEY, TOKEN_SIGNATURE_ADMIN, TOKEN_SIGNATURE_ADMIN_Refresh, TOKEN_SIGNATURE_USER, TOKEN_SIGNATURE_USER_Refresh } from "../../../config/config.service.js";
import * as dbRepo from "../../DB/db.repostory.js"
import userModel from "../../DB/Models/User.Model.js";
import CryptoJS from "crypto-js";
import jwt from 'jsonwebtoken';
import { RoleEnum } from "../../Common/Enums/user.enums.js";
import { tokenType } from "../../Common/Enums/token.enums.js";
import { decodedToken, generateToken, getSignature, verfiyToken } from "../../Common/Security/token.js";
import { decryptValue } from "../../Common/Security/bycript.js";

export async function getById(userData) {

  
    return userData
 }


 export async function renewToken(userData) {
    const{accessSignature}=getSignature()
     const newAccessToken = generateToken({signature:accessSignature,options:{
             audience:[userData.role,tokenType.access] ,
             expiresIn:60*15,
             subject:userData._id.toString()
           }})
     return newAccessToken 
 }

 
 export async function uploadProfilePic(userId,file){
      

return   await dbRepo.updateOne({model:userModel,filters:{_id:userId},
        data:{profilePicture:file.finalPath},options:{upsert:true}})


 }

 export async function uploadCovPic(userId,files){
      
  const finalPath=  files.map((file)=>{
        return file.finalPath
    })

    // const covPicsPath=[]
    // for (const file of files) {
    //     covPicsPath.push(file.finalPath)
    // }
 return  await dbRepo.updateOne({model:userModel,filters:{_id:userId},
        data:{covPic:finalPath},options:{upsert:true}})


 }

 export async function getProfile(profileId) {

    const user = await dbRepo.findById({id:profileId,model:userModel,select:"-password -role -confrimEmail -provider -createdAt -updatedAt -__v"})
    if(!user){
      throw new Error("Not found user",{cause:{statuscode:404}})
    }
   
    if(user.phone){
       user.phone = decryptValue({value:user.phone})
    }
    return user
    
 }

