import joi from "joi"
import { commonValditions } from "../../Middleware/validation.middleware.js"

export const logInschema = {
  body: joi.object({}).keys({
    email: commonValditions.email.required(),
    password: commonValditions.password.required(),

  })

}
export const logIn2FASchema = {
  body: joi.object({}).keys({
    email: commonValditions.email.required(),
    otp: commonValditions.otp.required(),

  })

}

export const signUpschema = {
  query: joi.object({}).keys({
    ln: joi.string().valid()
  }),

  body: joi.object({}).keys({

    userName: commonValditions.userName.required(),
    email: commonValditions.email.required(),
    password: commonValditions.password.required(),
    confrimPassword:commonValditions.confrimPassword.required(),
    phone:commonValditions.phone,
    DOB:commonValditions.DOB,
    gender:commonValditions.gender,

  }).required()
}
export const confrimEmailschema={
  body:joi.object({}).keys({
    email: commonValditions.email.required(),
    otp:commonValditions.otp.required()
  })
}
export const verfiyOTPforgetPasswordschema={
  body:joi.object({}).keys({
    email: commonValditions.email.required(),
    otp:commonValditions.otp.required()
  })
}
export const resetPasswordschema={
  body:joi.object({}).keys({
    email: commonValditions.email.required(),
    otp:commonValditions.otp.required(),
    password:commonValditions.password.required()
  })
}
export const resendConfrimEmailschema={
  body:joi.object({}).keys({
    email: commonValditions.email.required(),
  })
}
export const sendOTPforgetPasswordschema={
  body:joi.object({}).keys({
    email: commonValditions.email.required(),
  })
}

export const sendResetPasswordLinkschema={
  body:joi.object({}).keys({
    email: commonValditions.email.required(),
  })
}
export const resetPasswordWithLinkschema={
  body:joi.object({}).keys({
    token: joi.string().required(),
    newPassword: commonValditions.password.required(),
  })
}