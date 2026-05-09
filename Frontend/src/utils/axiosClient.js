import axios from "axios"

const axiosClient = axios.create({
    baseURL: 'https://code-black-tmc9.onrender.com',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});


export default axiosClient;

