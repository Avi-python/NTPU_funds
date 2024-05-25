import { toast } from "react-toastify"
import axios from 'axios'
import { getSignature } from "../services/blockchain"
import customAxios from '../utils/customAxios'    


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

const requestApplicants = async () => {
    try{
        const interceptor = customAxios();
        const response = await interceptor.get(`${serverURL}/auth/applicants/`);
        console.log(response.data);
        return response.data;
    } catch (error) {
        toast.error('Failed to get applicants.');
        throw error;
    }
}

const requestLogin = async () => {
    const { signature, msg_hash } = await getSignature(generateRandomString(10));
    try {

        const response = await axios.post(`${serverURL}/auth/token/`, {
            message_hash: msg_hash,
            signature: signature
        });

        console.log("requestLogin response: ", response.data);

        localStorage.setItem('authTokenRefresh', response.data.refresh);
        localStorage.setItem('authTokenAccess', response.data.access);

    } catch (error) {
        console.log(error);
        toast.error('Failed to login.');
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
    requestApplicants,
    requestLogin,
};