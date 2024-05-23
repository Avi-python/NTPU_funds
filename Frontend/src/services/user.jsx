import { toast } from "react-toastify"
import axios from 'axios'
import { getSignature } from "../services/blockchain"

const serverURL = process.env.REACT_APP_SERVER_URL;

const register = async (form_data) => {

    console.log("serverurl", serverURL);

    const msg = generateRandomString(10);
    try{
        const { msg_hash, signature } = await getSignature(msg);

        form_data.append('message_hash', msg_hash);
        form_data.append('signature', signature);
        
        const response = await axios.post(`${serverURL}/auth/register/`, form_data, {
            headers: {
                'content-type': 'multipart/form-data'
            }
        })
        console.log(response.data);
        toast.success('Submit successfully, wait for approval.');
    } catch (error) {
        console.log(error);
        toast.error('Failed to submit.');
    }
}

function generateRandomString(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

export {
    register,
};