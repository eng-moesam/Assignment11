import express from "express"
import * as authservice from "./auth.service.js"

import joi from "joi"
import { validation } from "../../Middleware/validation.middleware.js"
import { logInschema, confrimEmailschema, signUpschema, resendConfrimEmailschema, verfiyOTPforgetPasswordschema, resetPasswordschema, sendOTPforgetPasswordschema, logIn2FASchema, sendResetPasswordLinkschema, resetPasswordWithLinkschema } from "./auth.valdation.js"
const authRouter = express.Router()
authRouter.post("/confrimEmail",
    validation(confrimEmailschema),
    async (req, res, next) => {
    try {
        const result = await authservice.confrimEmail(req.vbody)
        return res.status(201).json({ mes: "done" })
    } catch (error) {
        next(error)
    }
})
authRouter.post("/sendOTPForgetPassword",
    validation(sendOTPforgetPasswordschema),
    async (req, res, next) => {
    try {
        const result = await authservice.sendOTPforgetPassword(req.vbody.email)
        return res.status(201).json({ mes: "check your inpox" })
    } catch (error) {
        next(error)
    }
})
authRouter.post("/verfiyForgetPassword",
    validation(verfiyOTPforgetPasswordschema),
    async (req, res, next) => {
    try {
        const result = await authservice.verfiyOTPforgetPassword(req.vbody)
        return res.status(201).json({ mes: "verfird" })
    } catch (error) {
        next(error)
    }
})
authRouter.post("/resetPassword",
    validation(resetPasswordschema),
    async (req, res, next) => {
    try {
        const result = await authservice.resetPassword(req.vbody)
        return res.status(201).json({ mes: "your password reset" })
    } catch (error) {
        next(error)
    }
})

authRouter.post("/resendconfrimEmail",
    validation(resendConfrimEmailschema),
    async (req, res, next) => {
    try {
        const result = await authservice.resendOtpConfrimEmail(req.vbody.email)
        return res.status(201).json({ mes: "check your inbox" })
    } catch (error) {
        next(error)
    }
})
authRouter.post("/resendForgetPasswordOtp",
    validation(resendConfrimEmailschema),
    async (req, res, next) => {
    try {
        const result = await authservice.resendForgetPasswordOtp(req.vbody.email)
        return res.status(201).json({ mes: "check your inbox" })
    } catch (error) {
        next(error)
    }
})

authRouter.post("/signUp", validation(signUpschema), async (req, res, next) => {
       
    //    console.log(req.file);
       
    //   validation(signUpschema)
    try {

        const result = await authservice.signUp(req.vbody)
        return res.status(201).json({ mes: "check your inbox", result })
       
    } catch (error) {
        next(error)

    }
})

authRouter.post("/signup/gmail", async (req, res, next) => {

    try {
        const result = await authservice.signupWithGmail(req.body)
        return res.status(201).json({ mes: "done", result })

    } catch (error) {
        return res.json(next(error))
        

    }
})

authRouter.post("/logIn",validation(logInschema), async (req, res, next) => {
    // console.log();
    
    try {
        const result = await authservice.login(req.body,req.protocol,req.host)
        return res.status(201).json({ mes: "done", result })

    } catch (error) {
        next(error)

    }
})

authRouter.post("/logInFA",validation(logIn2FASchema), async (req, res, next) => {
    
    try {
        const result = await authservice.loginFor2FA(req.body,req.protocol,req.host)
        return res.status(201).json({ mes: "done", result })

    } catch (error) {
        next(error)

    }
})

authRouter.post("/sendResetPasswordLink",validation(sendResetPasswordLinkschema), async (req, res, next) => {
    try {
        const result = await authservice.sendPasswordResetLink(req.body.email)
        return res.status(201).json({ mes: "done", result })
    } catch (error) {
        next(error)
    }
})
authRouter.post("/resetPasswordWithLink",validation(resetPasswordWithLinkschema), async (req, res, next) => {
    try {
        const result = await authservice.resetPasswordWithJwt(req.body)
        return res.status(201).json({ mes: "done", result })
    } catch (error) {
        next(error)
    }
})



export default authRouter

