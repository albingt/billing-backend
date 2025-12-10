import axios from 'axios';

const server_url = 'http://localhost:8080/api'

export const commonAPI = async (method, url, body, headers) => {
    try {
        const fullurl = `${server_url}${url}`
        const result = await axios({
            method,
            url: fullurl,
            data: body,
            headers: {
                'Content-Type': 'application/json',
                ...headers
            }
        })

        return result.data;
    } catch (error) {
        const errormessage = error.response.data || 'Error while sending the request';

        return {
            success: false,
            error: errormessage
        }
    }
}