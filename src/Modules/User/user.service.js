import { ENCRPTION_KEY, TOKEN_SIGNATURE_ADMIN, TOKEN_SIGNATURE_ADMIN_Refresh, TOKEN_SIGNATURE_USER, TOKEN_SIGNATURE_USER_Refresh } from "../../../config/config.service.js";
import * as dbRepo from "../../DB/db.repostory.js"
import userModel from "../../DB/Models/User.Model.js";
import CryptoJS from "crypto-js";
import jwt from 'jsonwebtoken';
import { RoleEnum } from "../../Common/Enums/user.enums.js";
import { tokenType } from "../../Common/Enums/token.enums.js";
import { decodedToken, generateToken, getSignature, verfiyToken } from "../../Common/Security/token.js";

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
