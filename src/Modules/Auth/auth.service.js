import { compare, hash } from "bcrypt";
import userModel from "../../DB/Models/User.Model.js";
import * as dbRepo from "../../DB/db.repostory.js"
import { ENCRPTION_KEY, SALT_ROUNDS, TOKEN_SIGNATURE_ADMIN, TOKEN_SIGNATURE_ADMIN_Refresh, TOKEN_SIGNATURE_USER, TOKEN_SIGNATURE_USER_Refresh, WEB_CLIENT_ID } from "../../../config/config.service.js";
import { compareOperation, hashOperation } from "../../Common/Security/hash.js";
import CryptoJS from "crypto-js";
import jwt from 'jsonwebtoken';
import { providerEnum, RoleEnum } from "../../Common/Enums/user.enums.js";
import { tokenType } from "../../Common/Enums/token.enums.js";
import { generateToken, genratesignToken, getSignature } from "../../Common/Security/token.js";
import { decryptString } from "../../Common/Security/bycript.js";
import { OAuth2Client } from 'google-auth-library';
import { sendEmail } from "../../Common/Services/Email/send.email.js";
import { temblateEmail } from "../../Common/Services/Email/email.temblate.js";
import { OtpMpdel as OtpModel } from "../../DB/Models/Otp.Models.js";

// Encrypt
// var ciphertext = CryptoJS.AES.encrypt('my message', 'secret key 123').toString();
// Decrypt
// var bytes  = CryptoJS.AES.decrypt(ciphertext, 'secret key 123');
// var originalText = bytes.toString(CryptoJS.enc.Utf8);
// console.log(originalText); 
const createOtp = () => {
  return Math.floor(Math.random() * (999999 - 100000 + 1) + 100000)
}


export const sendOtp = async (data) => {
  const { email } = data
  const code = createOtp()


  const hashedCode = await hashOperation({
    plaintext: code.toString(),
    round: SALT_ROUNDS
  })

  await dbRepo.updateOne({
    model: OtpModel,
    filters: { email }, data: { otp: hashedCode }, options: { upsert: true }
  })

  await sendEmail({
    to: email,
    subject: "this is your verfiy code",
    html: temblateEmail(code)
  })
  return { message: "OTP sent to email", email: email };
}


export async function signUp(bodyData) {

  const { email, otp } = bodyData;
  const emailexist = await dbRepo.findOne({ model: userModel, filters: { email } })


  if (emailexist) {
    throw new Error("email already exist", { cause: { statuscode: 404 } })
  }

  const otpUser = await dbRepo.findOne({ model: OtpModel, filters: { email } })
  if (!otpUser) {
    throw new Error("otp not found or expired. Request a new otp. or Email dont send otp", { cause: { statuscode: 400 } });
  }
  const isotp = await compareOperation({ plaintext: otp, hashedvalue: otpUser.otp })
  if (!isotp) {
    throw new Error("invalid", { cause: { statuscode: 400 } });
  }
  

  bodyData.password = await hashOperation({ plaintext: bodyData.password, round: SALT_ROUNDS })
  bodyData.phone = CryptoJS.AES.encrypt(bodyData.phone, ENCRPTION_KEY).toString();
  delete bodyData.otp;
  const result = await dbRepo.create({ model: userModel, data: bodyData })
  await dbRepo.findOneAndDelete({
    model: OtpModel,
    filters: { email: email }
  });
  return result

}


export async function signUpwithImage(bodyData, file) {

  const { email, otp } = bodyData;
  const emailexist = await dbRepo.findOne({ model: userModel, filters: { email } })


  if (emailexist) {
    throw new Error("email already exist", { cause: { statuscode: 404 } })
  }

  const otpUser = await dbRepo.findOne({ model: OtpModel, filters: { email } })
  if (!otpUser) {
    throw new Error("otp not found or expired. Request a new otp. or Email invalid", { cause: { statuscode: 400 } });
  }
  const isotp = await compareOperation({ plaintext: otp, hashedvalue: otpUser.otp })
  if (!isotp) {
    throw new Error("invalid", { cause: { statuscode: 400 } });
  }
  let image = ""
  if (file) {
    image = `http://localhost:3000/tmp/${file.filename}`
  }

  bodyData.password = await hashOperation({ plaintext: bodyData.password, round: SALT_ROUNDS })
  bodyData.phone = CryptoJS.AES.encrypt(bodyData.phone, ENCRPTION_KEY).toString();
  delete bodyData.otp;
  const result = await dbRepo.create({ model: userModel, data: { ...bodyData, profilePicture: image } })
  await dbRepo.findOneAndDelete({
    model: OtpModel,
    filters: { email: email }
  });
  return result

}

export async function login(bodyData, protocol, host) {

  const { email, password } = bodyData
  const user = await dbRepo.findOne({ model: userModel, filters: { email } })

  if (!user) {
    throw new Error("invalid info", { cause: { statuscode: 404 } })

  }
  const ispassword = await compareOperation({ plaintext: password, hashedvalue: user.password })


  user.phone = decryptString({ decryptedValue: user.phone })

  if (!ispassword) {
    throw new Error("invalid info", { cause: { statuscode: 404 } })
  }


  const { accessSignature, refreshSignature } = getSignature(user.role)

  const acsses_token = generateToken({
    payload: { sub: user._id }, signature: accessSignature, options: {
      audience: [user.role, tokenType.access],
      expiresIn: 60 * 15
    }
  })

  const refresh_token = generateToken({
    payload: { sub: user._id }, signature: refreshSignature, options: {
      audience: [user.role, tokenType.refresh],
      expiresIn: "1y"
    }
  })

  return { acsses_token, refresh_token, user }

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


