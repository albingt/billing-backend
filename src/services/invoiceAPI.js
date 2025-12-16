import { commonAPI } from "./commonapi"

export const fetchInvoiceAPI = async (query, header) => {
    return await commonAPI('GET', `/invoice?${query}`, undefined, header)
}

export const fetchInvoiceDetailsAPI = async (id, header) => {
    return await commonAPI('GET', `/invoice/${id}`, undefined, header)
}