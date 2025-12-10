import { commonAPI } from "./commonapi"

export const allProductsAPI = async (query, header) => {
    return await commonAPI('GET', `/product?${query}`, undefined, header)
}

export const productProfitReportAPI = async (query, header) => {
    return await commonAPI('GET', `/product/report?${query}`, undefined, header)
}

export const searchProductstAPI = async (query, header) => {
    return await commonAPI('GET', `/product/search?${query}`, undefined, header)
}

export const addProductAPI = async (body, header) => {
    return await commonAPI('POST', '/product', body, header)
}

export const editProductAPI = async (id, body, header) => {
    return await commonAPI('PUT', `/product/${id}`, body, header)
}

export const deleteProductAPI = async (id, header) => {
    return await commonAPI('DELETE', `/product/${id}`, undefined, header)
}