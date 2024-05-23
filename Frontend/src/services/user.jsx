const axios = require('axios');

const serverURL = process.env.SERVER_URL;

const register = async (data) => {
    try {
        const response = await axios.post(`${serverURL}/authentication/register`, data);
        return response.data;
    } catch (error) {
        return error;
    }
}

export {
    register,
};