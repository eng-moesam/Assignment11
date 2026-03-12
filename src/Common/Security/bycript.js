import { ENCRPTION_KEY } from "../../../config/config.service.js";
import CryptoJS from "crypto-js";


export function encryptValue({value,encrotionKey = ENCRPTION_KEY }){
       return  CryptoJS.AES.encrypt(value, encrotionKey).toString();
   
  }
export function decryptValue({ value ,encrotionKey = ENCRPTION_KEY }) {
     const bytes  = CryptoJS.AES.decrypt(value, encrotionKey);
        const originalText = bytes.toString(CryptoJS.enc.Utf8);
       

       return originalText

}

