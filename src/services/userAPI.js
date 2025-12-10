import { commonAPI } from "./commonapi"

export const loginAPI = async (body) => {
    return await commonAPI('POST', '/user/login', body)
}

export const userProfileAPI = async (header) => {
    return await commonAPI('GET', '/user', undefined, header)
}

export const allUsersAPI = async (query, header) => {
    return await commonAPI('GET', `/user/all?${query}`, undefined, header)
}

export const addUserAPI = async (body, header) => {
    return await commonAPI('POST', '/user/register', body, header)
}

export const editUserAPI = async (id, body, header) => {
    return await commonAPI('PUT', `/user/${id}`, body, header)
}

export const deleteUserAPI = async (id, header) => {
    return await commonAPI('DELETE', `/user/${id}`, undefined, header)
}