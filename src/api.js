import axios from 'axios';

// 模拟的后端API地址
// const API_BASE_URL = 'http://' + window.location.hostname + ':80/api';
const API_BASE_URL = '/api'; // 前端请求会由代理转发到后端


// 模拟一个延时函数
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 模拟获取WiFi列表
export const getWifiList = async () => {
    console.log('Fetching WiFi list...', API_BASE_URL);
    try {
        const response = await axios.get(`${API_BASE_URL}/wifi-list`);
        const data = response.data.map(item => ({
            ...item,
            ssid: decodeURIComponent(JSON.parse(`"${item.ssid.replace(/\\x/g, '%')}"`)) // 解码转义字符
        }));
        return data;
    } catch (error) {
        console.error('Error fetching WiFi list:', error);
        throw error;
    }
};


// 模拟获取屏幕ID
export const getScreenId = async () => {
    console.log('Fetching Screen ID...');
    try {
        const response = await axios.get(`${API_BASE_URL}/getScreenId`)
        console.log('screen id, Response:', response.data);
        return response.data
    } catch (error) {
        console.error('Error fetching Screen ID:', error);
        throw error;
    }
};


// 模拟提交WiFi配置，增加随机失败的可能性
export const postWifiConfig = async (ssid, password) => {
    console.log(`The user posted WiFi config for SSID: ${ssid} PASSWORD: ${password}`);
    try {
        const response = await axios.get(`${API_BASE_URL}/wifi-config`, {
            params: {
                ssid: ssid,
                password: password
            }
        })
        return response.data
    } catch (error) {
        console.error('Error posting WiFi config:', error);
        throw error;
    }

};

// 模拟获取配网状态，增加随机返回密码错误的可能性
let statusRequestCount = 0;
export const getWifiStatus = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/wifi-status`)
        console.log('wifi status, Response:', response.data);
        return response.data
    } catch (error) {
        console.error('Error getting WiFi status:', error);
        throw error;
    }
};

// =================================================================
// Pintura Cloud APIs
// =================================================================

const PINTURA_CN_URL = 'http://cloud-service.austinelec.com:8080';
const PINTURA_US_URL = 'http://cloud-service-us.austinelec.com:8080';
const PINTURA_DEV_URL = 'http://139.224.192.36:8082';

// API URL Management
export const getPinturaApiBaseUrl = () => {
  return localStorage.getItem('pintura_api_base_url') || PINTURA_CN_URL; // Default to CN
};

export const setPinturaApiBaseUrl = (url) => {
  localStorage.setItem('pintura_api_base_url', url);
};


// Token management
export const saveToken = (token) => localStorage.setItem('pintura_token', token);
export const getToken = () => localStorage.getItem('pintura_token');
export const removeToken = () => localStorage.removeItem('pintura_token');
export const saveAccount = (account) => localStorage.setItem('pintura_account', account);
export const getAccount = () => localStorage.getItem('pintura_account');

// Create a new axios instance for Pintura APIs
const pinturaApi = axios.create({
    // No baseURL here, it will be set by the interceptor
});

// Add a request interceptor to include the token in the header and set dynamic baseURL
pinturaApi.interceptors.request.use(
    config => {
        const token = getToken();
        if (token) {
            config.headers['X-TOKEN'] = token;
        }
        config.baseURL = getPinturaApiBaseUrl(); // Set base URL dynamically for every request
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

/**
 * 登录
 * @param {string} account - 账号 (手机号/邮箱)
 * @param {string} password - 密码
 * @param {string} areaCode - 区号 (e.g., '86')
 */
export const login = async (account, password, areaCode) => {
    // Determine URL based on areaCode and save it for future requests
    const baseUrl = (areaCode === '86') ? PINTURA_CN_URL : PINTURA_US_URL;
    setPinturaApiBaseUrl(baseUrl);

    const loginType = account.includes('@') ? 3 : 2;
    
    const requestBody = {
        account,
        password,
        loginType,
    };

    // 只在手机号登录时添加区号
    if (loginType === 2 && areaCode) {
        requestBody.areaCode = areaCode;
    }

    console.log('Sending login request:', requestBody);
    
    // The interceptor will now use the URL we just set
    const response = await pinturaApi.post('/api/v1/account/login', requestBody);
    
    // 根据后端响应结构, token直接存在于 'data' 字段中
    const token = response.data?.data;

    if (token && typeof token === 'string') {
        saveToken(token);
        saveAccount(account); // 保存账号
        console.log('Login success, token saved.');
    } else {
        console.warn('Login response did not contain a valid token in the `data` field.', response.data);
    }
    
    return response.data;
};

/**
 * 获取屏组列表
 */
export const getScreenGroupList = async () => {
    console.log('Fetching screen group list...');
    const response = await pinturaApi.get('/api/v1/host/screen/group/list');
    return response.data; // 假设返回的数据在 data 字段
};

/**
 * 创建新屏组并添加当前屏幕
 * @param {string} groupName - 新屏组的名称
 * @param {string} screenId - 当前屏幕的ID
 */
export const createScreenGroup = async (groupName, screenId) => {
    console.log(`Creating screen group "${groupName}" and adding screen ${screenId}`);
    const requestBody = {
        screenGroupName: groupName,
        screenIdList: [screenId],
        type: 1, // 默认为本地
    };
    const response = await pinturaApi.post('/api/v1/host/screen/group/add', requestBody);
    return response.data;
};

/**
 * 将当前屏幕添加到已有屏组
 * @param {number} groupId - 目标屏组的ID
 * @param {string} screenId - 当前屏幕的ID
 */
export const joinScreenGroup = async (groupId, screenId) => {
    console.log(`Adding screen ${screenId} to group ${groupId}`);
    const requestBody = {
        screenGroupId: groupId,
        screenIdList: [screenId],
    };
    const response = await pinturaApi.post('/api/v1/host/screen/group/join', requestBody);
    return response.data;
}; 
