import userModel from "../../DB/Models/User.Model.js";
import * as dbRepo from "../../DB/db.repostory.js"
import { ENCRPTION_KEY, FRONTEND_URL, PASSWORD_RESET_EXPIRES_MIN, PASSWORD_RESET_SECRET, WEB_CLIENT_ID } from "../../../config/config.service.js";
import { compareOperation, hashOperation } from "../../Common/Security/hash.js";
import CryptoJS from "crypto-js";
import { providerEnum } from "../../Common/Enums/user.enums.js";
import { genratesignToken,generateToken,verfiyToken} from "../../Common/Security/token.js";
import { decryptValue } from "../../Common/Security/bycript.js";
import { OAuth2Client } from 'google-auth-library';
import { sendEmail } from "../../Common/Services/Email/send.email.js";
import { temblateEmail } from "../../Common/Services/Email/email.temblate.js";
import { createOtp} from "../../Common/Services/Email/otp.service.js";
import { EmailEnum } from "../../Common/Enums/email.enums.js";
import * as redisMethods from "../../Common/Services/Redis/redis.service.js"
import { Enaple2FA, send2FACode } from "../User/user.service.js";
import { randomUUID } from "node:crypto";


export async function sendEmailOtp({email,emailType,subject}) {
  const prevOtp = await redisMethods.ttl( redisMethods.getOtpKey({email,emailType}))
 if (prevOtp > 0) {
   throw new Error(`There is already OTP expire after ${prevOtp} s`)
 }

 const isBloked = await redisMethods.exists(redisMethods.getOtpBlockedKey({email,emailType}))

 if (isBloked) {

 const blockTime = await redisMethods.ttl(redisMethods.getOtpBlockedKey({email,emailType})) /60
  
   throw new Error(`you have ablock you can send after ${Math.floor(blockTime)} M` );
   
   
 }

 const reqNo = await redisMethods.get(redisMethods.getOtpSendNO({email,emailType}))

 if (reqNo == 5) {
   await redisMethods.set({
     key: redisMethods.getOtpBlockedKey({email,emailType}),
     value: 1
     , exValue: 600
   })

   throw new Error("yon dont send more request 5 email in 20 min  ");

 }


 const otp = createOtp()
 await sendEmail({ to: email, subject: subject, html: temblateEmail(otp) })


 await redisMethods.set({
   key:  redisMethods.getOtpKey({email,emailType}),
   value: await hashOperation({ plaintext: String(otp) }), exValue: 300
 })
 await redisMethods.incr(redisMethods.getOtpSendNO({email,emailType}))

}

export async function signUp(bodyData) {

 const { email } = bodyData;
 const emailexist = await dbRepo.findOne({ model: userModel, filters: { email } })

 if (emailexist) {
   throw new Error("email already exist", { cause: { statuscode: 404 } })
 }


 bodyData.password = await hashOperation({ plaintext: bodyData.password })
 bodyData.phone = CryptoJS.AES.encrypt(bodyData.phone, ENCRPTION_KEY).toString();
 const result = await dbRepo.create({ model: userModel, data: bodyData })

 await sendEmailOtp({email,emailType:EmailEnum.confrimEmail,subject:EmailEnum.confrimEmail})  
 
 return result

}

export async function confrimEmail(bodyData) {

 const { email, otp } = bodyData
 const user = await dbRepo.findOne({ model: userModel, filters: { email, confrimEmail: false } })

 if (!user) {
   throw new Error("email already exist", { cause: { statuscode: 409 } })
 }
 const storedOtp = await redisMethods.get( redisMethods.getOtpKey({email,emailType:EmailEnum.confrimEmail}))
 if (!storedOtp) {
   throw new Error("expired Otp", { cause: { statuscode: 404 } })
 }
 const isOtpValid = await compareOperation({ plaintext: otp, hashedvalue: storedOtp })
 if (!isOtpValid) {
   throw new Error("otp not valid", { cause: { statuscode: 404 } })
 }
 user.confrimEmail = true,
   await user.save();
}
export async function resendOtpConfrimEmail(email) {
    await sendEmailOtp({email,emailType:EmailEnum.confrimEmail,subject:EmailEnum.confrimEmail})  
}
export async function resendForgetPasswordOtp(email) {
    await sendEmailOtp({email,emailType:EmailEnum.forgetPassword,subject:EmailEnum.forgetPassword})  
}
export async function sendOTPforgetPassword(email) {
    const user= await dbRepo.findOne({model:userModel,filters:{email}})
    if (!user) {
     return;
    }
    if (!user.confrimEmail) {
     throw new Error("confrim your email frist");
     
    }
    await sendEmailOtp(
     {email,emailType:EmailEnum.forgetPassword,subject:EmailEnum.forgetPassword})  
}

export async function verfiyOTPforgetPassword(bodyData) {

 const {email,otp} = bodyData
 
 const emailOtp = await redisMethods.get(
   redisMethods.getOtpKey({
     email,
     emailType: EmailEnum.forgetPassword
   })
 )
 if (!emailOtp) {

   throw new Error("otp Expired");
   
   
 }
  const storedOtp = await redisMethods.get(redisMethods.getOtpKey({email,emailType:EmailEnum.forgetPassword})) 
 if (!storedOtp) {
   throw new Error("expired Otp", { cause: { statuscode: 404 } })
 }
 const isOtpValid = await compareOperation({ plaintext: otp, 
   hashedvalue: storedOtp })
 if (!isOtpValid) {
   throw new Error("otp not valid", { cause: { statuscode: 404 } })
 }

 
}
export async function resetPassword(bodyData) {
 const {email,password,otp}= bodyData
 await verfiyOTPforgetPassword({email,otp})

 await dbRepo.updateOne({
   model:userModel,
   filters:{email},
   data:{password:await hashOperation({plaintext:password})}
 })

}
export async function login(bodyData) {
  const { email, password } = bodyData;

  const user = await dbRepo.findOne({ model: userModel, filters: { email } });

  if (!user) {
    throw new Error("invalid info", { cause: { statuscode: 404 } });
  }

  if (!user.confrimEmail) {
    throw new Error("you need to confrim your email", { cause: { statuscode: 404 } });
  }

  const blockedKey = redisMethods.getLoginBlockedKey({ email });
  const isBlocked = await redisMethods.exists(blockedKey);

  if (isBlocked) {
    const remainSeconds = await redisMethods.ttl(blockedKey);
    throw new Error(`account is blocked, try again after ${remainSeconds} seconds`, {
      cause: { statuscode: 409 }
    });
  }

  const ispassword = await compareOperation({
    plaintext: password,
    hashedvalue: user.password
  });

  if (!ispassword) {
    const failKey = redisMethods.getLoginFailKey({ email });
    const tryLoginNo = await redisMethods.incr(failKey);

    if (tryLoginNo == 1) {
      await redisMethods.set({
        key: failKey,
        value: tryLoginNo,
        exValue: 60 * 5
      });
    }

    if (tryLoginNo >= 5) {
      await redisMethods.set({
        key: blockedKey,
        value: 1,
        exValue: 60 * 5
      });

      await redisMethods.del(failKey);

      throw new Error("account blocked for 5 minutes", {
        cause: { statuscode: 409 }
      });
    }

    throw new Error("invalid info", { cause: { statuscode: 404 } });
  }

  await redisMethods.del(redisMethods.getLoginFailKey({ email }));
  await redisMethods.del(blockedKey);
  if(user.isStepVerficationEnabled){
  const result =  await send2FACode(user,false)
  return result;
  }
  const { acsses_token, refresh_token } = genratesignToken(user);
  return { acsses_token, refresh_token };
}
export async function loginFor2FA(bodyData) {
  const { email,otp } = bodyData;

  const user = await dbRepo.findOne({ model: userModel, 
    filters: { email ,confrimEmail:{$exists:true},provider:providerEnum.System } });

  if (!user) {
    throw new Error("invalid info", { cause: { statuscode: 404 } });
  }

 const result = await Enaple2FA(user,{otp},false)
  
  const { acsses_token, refresh_token } = genratesignToken(user);
  return { result, acsses_token, refresh_token };
}

// export async function login(bodyData, protocol, host) {

//   const { email, password } = bodyData
//   const user = await dbRepo.findOne({ model: userModel, filters: { email
//    } })

//   if (!user) {
//     throw new Error("invalid info", { cause: { statuscode: 404 } })

//   }
//   if (!user.confrimEmail) {
//     throw new Error("you need to confrim your email", { cause: { statuscode: 404 } })
//   }

//   const ispassword = await compareOperation({ plaintext: password, hashedvalue: user.password })


//   user.phone = decryptValue({ value: user.phone })

//   if (!ispassword) {
//     throw new Error("invalid info", { cause: { statuscode: 404 } })
//   }

//   const { acsses_token, refresh_token } = genratesignToken(user);
//   return { acsses_token, refresh_token }

// }

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



const RESET_AUDIENCE = "password_reset";
export async function sendPasswordResetLink(email) {
  const user = await dbRepo.findOne({ model: userModel, filters: { email } });
  if (!user) {
    throw new Error("user not found", { cause: { statuscode: 404 } });
  };
  if (!user.confrimEmail) {
    throw new Error("confirm your email first", { cause: { statuscode: 400 } });
  }
  const prevResetPasswordLink = await redisMethods.ttl(redisMethods.getPasswordResetJtiKey(jti))
  if (prevResetPasswordLink > 0) {
    throw new Error("reset password link already sent", { cause: { statuscode: 400 } });
  }
  const jti = randomUUID();
  const expiresMin = PASSWORD_RESET_EXPIRES_MIN * 60;
  const token = generateToken({
    payload: { sub: user._id.toString() },
    signature: PASSWORD_RESET_SECRET,
    options: {
      expiresIn: expiresMin,
      jwtid: jti,
      audience: RESET_AUDIENCE,
    },
  });
  await redisMethods.set({
    key: redisMethods.getPasswordResetJtiKey(jti),
    value: user._id.toString(),
    exValue: expiresMin,
  });
  const link = `${FRONTEND_URL}/reset-password?token=${encodeURIComponent(token)}`;
  await sendEmail({
    to: email,
    subject: "Reset password",
    html: `<p>use this link to reset your password:</p><a href="${link}">${link}</a>`,
  });
}

export async function resetPasswordWithJwt({ token, newPassword }) {
  let decoded;
  try {
    decoded = verfiyToken({
      token,
      signature: PASSWORD_RESET_SECRET,
    });
  } catch {
    throw new Error("invalid or expired token", { cause: { statuscode: 400 } });
  }

  if (!decoded.aud || decoded.aud !== RESET_AUDIENCE) {
    throw new Error("invalid token purpose", { cause: { statuscode: 400 } });
  }

  const jti = decoded.jti;
  if (!jti) {
    throw new Error("invalid token", { cause: { statuscode: 400 } });
  }

  const key = redisMethods.getPasswordResetJtiKey(jti);
  const storedUserId = await redisMethods.get(key);

  if (!storedUserId || storedUserId !== decoded.sub) {
    throw new Error("token already used or invalid", { cause: { statuscode: 400 } });
  }

  await dbRepo.updateOne({
    model: userModel,
    filters: { _id: storedUserId },
    data: {
      password: await hashOperation({ plaintext: newPassword }),
      changeCreditTime: new Date(),
    },
  });

  await redisMethods.del(key);
}