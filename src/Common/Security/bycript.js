import { ENCRPTION_KEY } from "../../../config/config.service.js";
import CryptoJS from "crypto-js";
  


export function decryptString({decryptedValue ,encrotionKey = ENCRPTION_KEY }) {
     const bytes  = CryptoJS.AES.decrypt(decryptedValue, encrotionKey);
        const originalText = bytes.toString(CryptoJS.enc.Utf8);
       decryptedValue=originalText

       return decryptedValue

}