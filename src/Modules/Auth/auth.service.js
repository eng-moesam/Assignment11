import userModel from "../../DB/Models/User.Model.js";
import * as dbRepo from "../../DB/db.repostory.js"
import { ENCRPTION_KEY, SALT_ROUNDS, TOKEN_SIGNATURE_ADMIN, TOKEN_SIGNATURE_ADMIN_Refresh, TOKEN_SIGNATURE_USER, TOKEN_SIGNATURE_USER_Refresh, WEB_CLIENT_ID } from "../../../config/config.service.js";
import { compareOperation, hashOperation } from "../../Common/Security/hash.js";
import CryptoJS from "crypto-js";
import { providerEnum } from "../../Common/Enums/user.enums.js";
import { genratesignToken} from "../../Common/Security/token.js";
import { decryptValue } from "../../Common/Security/bycript.js";
import { OAuth2Client } from 'google-auth-library';
import { sendEmail } from "../../Common/Services/Email/send.email.js";
import { temblateEmail } from "../../Common/Services/Email/email.temblate.js";
import { otp } from "../../Common/Services/Email/otp.service.js";
import { EmailEnum } from "../../Common/Enums/email.enums.js";
import * as redisMethods from "../../Common/Services/Redis/redis.service.js"
  

export async function signUp(bodyData) {

  const { email} = bodyData;
  const emailexist = await dbRepo.findOne({ model: userModel, filters: { email } })

  if (emailexist) {
    throw new Error("email already exist", { cause: { statuscode: 404 } })
  }


  bodyData.password = await hashOperation({ plaintext: bodyData.password})
  bodyData.phone = CryptoJS.AES.encrypt(bodyData.phone, ENCRPTION_KEY).toString();
  const result = await dbRepo.create({ model: userModel, data: bodyData })

 await sendEmail({to:email,subject:EmailEnum.confrimEmail,html:temblateEmail(otp)})
 await  redisMethods.set({key:`OTP::${email}::${EmailEnum.confrimEmail}`,
  value:await hashOperation({plaintext:String(otp)}),exValue:520})
  return result

}

export async function confrimEmail(bodyData) {
 
  const {email , otp} =bodyData
    const user = await dbRepo.findOne({ model: userModel, filters: { email, confrimEmail:false } })
 
    if (!user) {
    throw new Error("email already exist", { cause: { statuscode: 409 } })
  }
 const storedOtp= await redisMethods.get(`OTP::${email}::${EmailEnum.confrimEmail}`)
 if (!storedOtp) {
    throw new Error("expired Otp", { cause: { statuscode: 404 } })
  }
  const isOtpValid=await compareOperation({plaintext:otp,hashedvalue:storedOtp})
  if(!isOtpValid){
        throw new Error("otp not valid", { cause: { statuscode: 404 } })
  }
  user.confrimEmail = true,
  await user.save();
}
export async function resendOtpConfrimEmail(email) {
 const prevOtp= await redisMethods.ttl(`OTP::${email}::${EmailEnum.confrimEmail}`)
  if (prevOtp>0) {
    throw new Error(`There is already OTP expire after ${prevOtp} s`)
  }
   await sendEmail({to:email,subject:EmailEnum.confrimEmail,html:temblateEmail(otp)})
 await  redisMethods.set({key:`OTP::${email}::${EmailEnum.confrimEmail}`,
  value:await hashOperation({plaintext:String(otp)}),exValue:520})
 
}
export async function login(bodyData, protocol, host) {

  const { email, password } = bodyData
  const user = await dbRepo.findOne({ model: userModel, filters: { email
   } })

  if (!user) {
    throw new Error("invalid info", { cause: { statuscode: 404 } })

  }
  if (!user.confrimEmail) {
    throw new Error("you need to confrim your email", { cause: { statuscode: 404 } })
  }
  const ispassword = await compareOperation({ plaintext: password, hashedvalue: user.password })


  user.phone = decryptValue({ value: user.phone })

  if (!ispassword) {
    throw new Error("invalid info", { cause: { statuscode: 404 } })
  }

  const { acsses_token, refresh_token } = genratesignToken(user);
  return { acsses_token, refresh_token }

}

async function verfiyGoogleTokenId(tokenId) {
  const client = new OAuth2Client();
  const ticket = await client.verifyIdToken({
    idToken: tokenId,
    audience: WEB_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  return payload
}

export async function loginWithGmail(idToken) {

  const payloadToken = await verfiyGoogleTokenId(idToken)
  if (!payloadToken.email_verified) {
    throw new Error("email not varfied", { cause: { statuscode: 403 } })
  }

  const user = await dbRepo.findOne({ model: userModel, filters: { email: payloadToken.email, provider: providerEnum.Google } })

  if (!user) {

    return signupWithGmail({ idToken })


  }

  const { acsses_token, refresh_token } = genratesignToken(user)

  return { acsses_token, refresh_token }

}

export async function signupWithGmail(bodyData) {

  const { idToken } = bodyData

  const payloadGoogleToken = await verfiyGoogleTokenId(idToken)



  if (!payloadGoogleToken.email_verified) {
    throw new Error("email not varfied", { cause: { statuscode: 403 } })
  }

  const user = await dbRepo.findOne({ model: userModel, filters: { email: payloadGoogleToken.email } })

  if (user) {
    if (user.provider == providerEnum.System) {
      throw new Error(" acount already exsit sign up with password and email")
    }
    return { status: 200, loginResult: await loginWithGmail(idToken) }
  }

  const newUser = await dbRepo.create({
    model: userModel, data: {
      email: payloadGoogleToken.email,
      userName: payloadGoogleToken.name,
      profilePicture: payloadGoogleToken.picture,
      confrimEmail: true,
      provider: providerEnum.Google
    }
  })
  const { acsses_token, refresh_token } = genratesignToken(newUser)

  return { status: 201, tokens: { acsses_token, refresh_token } }

}


