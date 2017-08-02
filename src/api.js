/**
 * Created by yqf on 5/21/17.
 */
import axios from 'axios';

const ADMIN_TOKEN = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiIxMDAwIiwiYWRtaW4iOnRydWV9.VX4w0RSx16yxuKyVAg9UNBY_M4ARdWn5eTvGr1aefW4";

let headers = {'Authorization': ADMIN_TOKEN};

/**
 * Parses the JSON returned by a network request
 *
 * @param  {object} response A response from a network request
 *
 * @return {object}          The parsed JSON from the request
 */
function parseJSON(response) {
    return response.data;
}

/**
 * Checks if a network request came back fine, and throws an error if not
 *
 * @param  {object} response   A response from a network request
 *
 * @return {object|undefined} Returns either the response, or throws an error
 */
function checkStatus(response) {
    if (response.status >= 200 && response.status < 300) {
        return response;
    }

    const error = new Error(response.statusText);
    error.response = response;
    throw error;
}

export function getClients() {
    return axios({
        method: 'GET',
        url: '/api/client/status',
        headers,
    })
        .then(checkStatus)
        .then(parseJSON);
}

export function getImages() {
    return axios({
        method: 'GET',
        url: '/api/images',
        headers,
    })
        .then(checkStatus)
        .then(parseJSON);
}

export function getImagesByType(type) {
    return axios({
        method: 'GET',
        url: `/api/images/type/${type}`,
        headers
    })
        .then(checkStatus)
        .then(parseJSON);
}

export function getImagesByClient(id) {
    return axios({
        method: 'GET',
        url: `/api/images/client/${id}`,
        headers
    })
        .then(checkStatus)
        .then(parseJSON);
}
