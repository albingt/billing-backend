import { commonAPI } from "./commonapi"

export const createSaleAPI = async (body, header) => {
    return await commonAPI('POST', '/bill', body, header)
}