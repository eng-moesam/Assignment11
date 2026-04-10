import { ENCRPTION_KEY, TOKEN_SIGNATURE_ADMIN, TOKEN_SIGNATURE_ADMIN_Refresh, TOKEN_SIGNATURE_USER, TOKEN_SIGNATURE_USER_Refresh } from "../../../config/config.service.js";
import * as dbRepo from "../../DB/db.repostory.js"
import userModel from "../../DB/Models/User.Model.js";
import CryptoJS from "crypto-js";
import jwt from 'jsonwebtoken';
import { RoleEnum } from "../../Common/Enums/user.enums.js";
import { tokenType } from "../../Common/Enums/token.enums.js";
import { decodedToken, generateToken, getSignature, verfiyToken } from "../../Common/Security/token.js";
import { decryptValue } from "../../Common/Security/bycript.js";
import path from "node:path";
import fs from "node:fs";
import * as redisMethods from "../../Common/Services/Redis/redis.service.js"
import { compareOperation, hashOperation } from "../../Common/Security/hash.js";
import { badRequstExpention, conflictExpention, notFoundExpention } from "../../Common/Response/response.js";
import { sendEmailOtp } from "../Auth/auth.service.js";
import { EmailEnum } from "../../Common/Enums/email.enums.js";
import { isBlockedSendOtp } from "../../Common/Services/Email/otp.service.js";
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

 export async function uploadProfilePic(userId, file) {
    const user = await dbRepo.findById({model:userModel,id:userId});
    if (!user) {
      throw new Error("Not found user", { cause: { statuscode: 404 } });
    }
  
    const gallery = user.gallery ?? [];
    if (user.profilePicture){ 
      gallery.push(user.profilePicture);}
  
    return dbRepo.updateOne({
      model: userModel,
      filters: { _id: user._id },
      data: { profilePicture: file.finalPath, gallery },
      options: { upsert: true },
    });
  }
  
  export async function uploadCovPic(userId, files) {
    const user = await dbRepo.findById({model:userModel,id:userId});
    if (!user) {
      throw new Error("Not found user", { cause: { statuscode: 404 } });
    }
    const existing = user.covPic ?? [];
    const newPaths = files.map(f => f.finalPath);
    
    const merged = [...existing, ...newPaths];
    const finalCovPic = merged.slice(-2); 
    
    if (finalCovPic.length !== 2) {
      throw new Error("You must end with exactly 2 cover pictures", {
        cause: { statuscode: 400 }
      });
    }
    
    return dbRepo.updateOne({
      model: userModel,
      filters: { _id: user._id },
      data: { covPic: finalCovPic },
      options: { upsert: true }
    });
  }
  
  export async function getProfile(profileId) {
    const user = await dbRepo.findById({
      id: profileId,
      model: userModel,
      select:
        "-password -role -confrimEmail -provider -createdAt -updatedAt -__v -profileVisits",
    });
    if (!user) {
      throw new Error("Not found user", { cause: { statuscode: 404 } });
    }
  
    await userModel.updateOne({ _id: profileId }, { $inc: { profileVisits: 1 } });
  
    if (user.phone) {
      user.phone = decryptValue({ value: user.phone });
    }
  
    return user;
  }
  
  export async function removeProfilePic(userId) {
    const user = await dbRepo.findById({model:userModel,id:userId});
    if (!user?.profilePicture) {
      throw new Error("No profile picture to delete", {
        cause: { statuscode: 404 },
      });
    }
    
    const relativePath = user.profilePicture.startsWith("uploads")
      ? `./${user.profilePicture}`
      : user.profilePicture;
    const fullPath = path.resolve(relativePath);
    if (fs.existsSync(fullPath)) {
      await fs.promises.unlink(fullPath);
    }

    return dbRepo.updateOne({
      model: userModel,
      filters: { _id: user._id },
      data: { profilePicture: null },
      options: { upsert: true },
    });
  }
  
  
  export async function getProfileVisits(profileId) {
    const user = await dbRepo.findById({id:profileId,model:userModel,select:"profileVisits"})
    if (!user) {
      throw new Error("Not found user", { cause: { statuscode: 404 } });
    }
    return user.profileVisits;
  }

  
 export async function logOut(userId,tokenData,logoutOptions) {
  // console.log(tokenData);
  // console.log({"tokenData.jti":tokenData.jti});
    if (!tokenData || !tokenData.jti) {
    //  console.error("Missing tokenData or jti:", tokenData);
     throw new Error("Invalid token data");
  }

  
  if (logoutOptions=="all") {
     await dbRepo.updateOne({model:userModel,filters:{_id:userId},data:{changeCreditTime:new Date()}})
  } else {

   const expirationSeconds = (60*60*24*365) - (Date.now()/1000 - tokenData.iat);
   const finalExpiry = Math.max(Math.floor(expirationSeconds));
   
   await redisMethods.set({
     key:`blackListToken::${userId}::${tokenData.jti}`,
     value:tokenData.jti,
     exValue:finalExpiry
   })
  
   

  }
}


export async function UpdatePassword(bodyData, userData) {

  const { newPassword, oldPassword } = bodyData

  const { password } = userData
  const isOldpassword = await compareOperation({ plaintext: oldPassword, hashedvalue: password })

  if (!isOldpassword) {

     throw new Error("invalid old password");


  }

  await dbRepo.updateOne(
     {
        model: userModel,
        filters: {
           _id: userData._id
        },
        data: {
           password: await hashOperation({ plaintext: newPassword }),
           changeCreditTime: new Date()
        }

     }
  )

}

export async function send2FACode(user,fristTick=true) {
  if(fristTick){
  if(user.isStepVerficationEnabled){
    return conflictExpention("2FA already enabled")
  }}

  await sendEmailOtp({email:user.email,
    emailType:EmailEnum.TwoStepFA,
    subject:EmailEnum.TwoStepFA
  })
   return "otp send to your Email"
}
export async function Enaple2FA(user,bodyData,firstTrick=true) {

  const {otp} = bodyData
  await isBlockedSendOtp({email:user.email,emailType:EmailEnum.TwoStepFA})

if(firstTrick){
  if(user.isStepVerficationEnabled){
    return conflictExpention("2FA already enabled")
  }}

  const isOtpFind = await redisMethods.get(redisMethods.getOtpKey({email:user.email,emailType:EmailEnum.TwoStepFA}))

  if (!isOtpFind) {

    return notFoundExpention("otp is expired")
    
  }

  const isotp =await compareOperation({plaintext:otp,hashedvalue:isOtpFind})

  if(!isotp){
    return badRequstExpention("invalid otp")
  }
if (firstTrick) {
  user.isStepVerficationEnabled=true
  await user.save()}

  await redisMethods.del(redisMethods.getOtpKey({email:user.email,emailType:EmailEnum.TwoStepFA}))
  

  return firstTrick? "2fA is done":"login Successfully"
  
}




