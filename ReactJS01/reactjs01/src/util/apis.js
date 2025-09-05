import axios from './axios.customize';

export const createUserApi = (name, email, password) => {
    const URL_API = "/v1/api/register";
    const data = {
        name, email, password
    }
    return axios.post(URL_API, data);
}

export const loginApi = (email, password) => {
    const URL_API = "/v1/api/login";
    const data = {
        email, password
    }
    return axios.post(URL_API, data);
}

export const getUserApi = () => {
    const URL_API = "/v1/api/user";
    return axios.get(URL_API);
}

export const getProductsByCategoryApi = (categoryId, page = 1, limit = 5) => {
  const URL_API = `/v1/api/category/${categoryId}/products?page=${page}&limit=${limit}`;
  return axios.get(URL_API);
};

export const getProductsByCategoryLazyApi = (categoryId, limit = 5, skip = 0) => {
  // Sửa thành 'skip' cho MongoDB
  const URL_API = `/v1/api/category/${categoryId}/products-lazy?limit=${limit}&skip=${skip}`;
  return axios.get(URL_API);
};