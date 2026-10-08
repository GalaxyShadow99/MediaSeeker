import { API_BASE_URL } from './config.js'

async function checkToken() {
    const token = sessionStorage.getItem('access_token');
    if (!token) {
        return false
    }
    try {
        const response = await fetch(`${API_BASE_URL}/media`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
        if (!response.ok) {
            if (response.status === 401) {
                sessionStorage.removeItem('access_token')
                return false
            }
            return false
        }
    } catch (error) {
        sessionStorage.removeItem('access_token')
        return false
    }
    return true
}

export { checkToken }