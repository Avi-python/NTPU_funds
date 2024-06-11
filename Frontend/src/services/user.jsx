import { toast } from "react-toastify"
import axios from 'axios'
import { getSignature } from "../services/blockchain"
import customAxios from '../utils/customAxios'   
import FileSaver from 'file-saver' 


const serverURL = process.env.REACT_APP_SERVER_URL;

const register = async (form_data) => {

    // console.log("serverurl", serverURL);

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

const createProgressCell = async (form_data) => {

    try{

        const interceptor = customAxios();
        await interceptor.post(`${serverURL}/project/create-progress-cell/`, form_data, {
            headers: {
                'content-type' : 'multipart/form-data'
            }
        });

    } catch (error) {
        throw error;
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

const requestCertifiedDoc = async (doc_name) => {
    try {
        const interceptor = customAxios();
        const response = await interceptor.post(`${serverURL}/auth/certified_doc/`, {
            doc_name,
        });

        return response;

    } catch (error) {
        console.log("fail to request doc: ", error.message);
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

const rejectApplicant = async (address) => {
    try {
        const interceptor = customAxios();
        const response = await interceptor.post(`${serverURL}/auth/reject_applicant/`, {
            address: address,
        });

        console.log(response.data);
        toast.success('Reject successfully.');
    } catch (error) {
        console.log(error);
        toast.error('Failed to reject.');
    }
}

const approveApplicant = async (address) => {
    try {
        const interceptor = customAxios();
        const response = await interceptor.post(`${serverURL}/auth/approve_applicant/`, {
            address: address,
        });

        console.log(response.data);
        toast.success('Approve successfully.');
    } catch (error) {
        console.log(error);
        toast.error('Failed to approve.');
    }
}

const requestProgress = async (projectId) => {
    try {
        const interceptor = customAxios();
        const response = await interceptor.post(`${serverURL}/project/get-progress/`, {
            projectId: projectId
        });

        console.log("requestProgress response: ", response.data.progress);

        return response.data.progress;
    } catch (error) {
        throw error;
    }
}

const requestProgressCellFileAndStore = async (projectId, progressCellId, fileName) => {
    try {
        const interceptor = customAxios();
        const response = await interceptor.post(`${serverURL}/project/get-progress-cell-file/`, {
            projectId: projectId,
            progressCellId: progressCellId,
            fileName: fileName
        }, {
            responseType: 'blob'
        });

        console.log("requestProgressCellFile response: ", response);

        const blob = new Blob([response.data], { type: response.headers['content-type'] });
        FileSaver.saveAs(blob, fileName);

        return response.data;
    } catch (error) {
        throw error;
    }
}

const requestAllProgressCellFiles = async (projectId, progressCellId, files) => {
    for (let i = 0; i < files.length; i++) {
        try {
            const response = await requestProgressCellFileAndStore(projectId, progressCellId, files[i]);
        } catch (error) {
            throw error;
        }
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
    createProgressCell,
    requestApplicants,
    requestCertifiedDoc,
    requestLogin,
    rejectApplicant,
    approveApplicant,
    requestAllProgressCellFiles,
    requestProgress,
};