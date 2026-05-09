import axios from "axios"

const axiosClient = axios.create({
    baseURL: 'https://code-black-1.onrender.com',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});


export default axiosClient;

