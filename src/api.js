import axios from 'axios';

// 模拟的后端API地址
const API_BASE_URL = '/api';

// 模拟一个延时函数
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 模拟获取WiFi列表
export const getWifiList = async () => {
    console.log('Fetching WiFi list...');
    await sleep(500);
    
    // 20% 的几率返回一个空列表来测试
    if (Math.random() < 0.2) {
        console.log('Simulating no WiFi found.');
        return [];
    }
    
    const mockWifiList = [
        { ssid: 'MyHomeWiFi', signal: -50 },
        { ssid: 'Office-Guest', signal: -65 },
        { ssid: 'Free_Public_WiFi', signal: -80 },
        { ssid: 'Free_Public_WiFi1', signal: -30 },
    ];
    console.log('Fetched WiFi list:', mockWifiList);
    return mockWifiList;
};

// 模拟获取屏幕ID
export const getScreenId = async () => {
    console.log('Fetching Screen ID...');
    await sleep(300); // Simulate network delay
    const mockScreenId = 'PinturaV2test00001';
    console.log('Fetched Screen ID:', mockScreenId);
    return mockScreenId;
};


// 模拟提交WiFi配置，增加随机失败的可能性
export const postWifiConfig = async (ssid, password) => {
    console.log(`Posting WiFi config for SSID: ${ssid}`);
    await sleep(1000);
    // 10% 几率模拟提交失败
    if (Math.random() < 0.1) {
        console.log('Simulating post config failure.');
        return { success: false, error: 'Failed to send configuration.' };
    }
    console.log('Posted WiFi config successfully.');
    return { success: true };
};

// 模拟获取配网状态，增加随机返回密码错误的可能性
let statusRequestCount = 0;
export const getWifiStatus = async () => {
    console.log(`Getting WiFi status (request count: ${statusRequestCount})...`);
    await sleep(200);
    statusRequestCount++;

    if (statusRequestCount <= 4) {
        console.log('Status: connecting');
        return { status: 'connecting' };
    }
    
    // 重置计数器，并根据随机值决定最终状态
    statusRequestCount = 0;
    const random = Math.random();
    if (random < 0.7) { // 70% 成功
        console.log('Status: success');
        return { status: 'success' };
    } else if (random < 0.9) { // 20% 密码错误
        console.log('Status: password_error');
        return { status: 'password_error' };
    } else { // 10% 超时
        console.log('Status: timeout');
        return { status: 'timeout' };
    }
};

// =================================================================
// Pintura Cloud APIs
// =================================================================

const PINTURA_API_BASE_URL = 'http://139.224.192.36:8082';

// Token management
export const saveToken = (token) => localStorage.setItem('pintura_token', token);
export const getToken = () => localStorage.getItem('pintura_token');
export const removeToken = () => localStorage.removeItem('pintura_token');
export const saveAccount = (account) => localStorage.setItem('pintura_account', account);
export const getAccount = () => localStorage.getItem('pintura_account');

// Create a new axios instance for Pintura APIs
const pinturaApi = axios.create({
    baseURL: PINTURA_API_BASE_URL,
});

// Add a request interceptor to include the token in the header
pinturaApi.interceptors.request.use(
    config => {
        const token = getToken();
        if (token) {
            config.headers['X-TOKEN'] = token;
        }
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
    
    // 发起真实的API调用
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