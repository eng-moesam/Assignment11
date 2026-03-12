import joi from "joi"
import { commonValditions } from "../../Middleware/validation.middleware.js"

export const logInschema = {
  body: joi.object({}).keys({
    email: commonValditions.email.required(),
    password: commonValditions.password.required(),

  })

}
export const sendOtpschema={
  body:joi.object({}).keys({
    email: commonValditions.email.required(),

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
     otp:  joi.string().required()

  }).required()
}