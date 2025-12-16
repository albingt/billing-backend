import { commonAPI } from "./commonapi"

export const fetchVoucherAPI = async (query, header) => {
    return await commonAPI('GET', `/voucher?${query}`, undefined, header)
}

export const addVoucherAPI = async (body, header) => {
    return await commonAPI('POST', '/voucher', body, header)
}

export const deleteVoucherAPI = async (id, header) => {
    return await commonAPI('DELETE', `/voucher/${id}`, undefined, header)
}