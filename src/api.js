import axios from 'axios';

// 后端API地址
// const API_BASE_URL = 'http://' + window.location.hostname + ':80/api';
const API_BASE_URL = '/api'; // 前端请求会由代理转发到后端，开发模式下使用这个


// 封装一个延时函数
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 模拟获取WiFi列表
export const getWifiList = async () => {
    console.log('Fetching WiFi list...', API_BASE_URL);
    try {
        //  模拟数据
        await sleep(1000);
        return [
            {
              "ssid": "MyHomeWiFi-5G",
              "signal": -45
            },
            {
              "ssid": "Office-Guest",
              "signal": -100
            },
            {
              "ssid": "Public_Free_WiFi",
              "signal": -82
            },
            {
                "ssid": "Public_Free_WiFi_2",
                "signal": -60
            },
            {
                "ssid": "Public_Free_WiFi_3",
                "signal": -60
            }
          ]
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


// 获取屏幕ID
export const getScreenId = async () => {
    console.log('Fetching Screen ID...');
    try {
        return 'PSb935e6L006761' // 测试用
        const response = await axios.get(`${API_BASE_URL}/getScreenId`)
        console.log('screen id, Response:', response.data);
        return response.data
    } catch (error) {
        console.error('Error fetching Screen ID:', error);
        throw error;
    }
};


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

export const getWifiStatus = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/wifi-status`)
        console.log('wifi status, Response:', response.data);
        return response.data  // TODO: 该接口后端没有按照json格式返回，需要后端修改，否则前端无法轮询WiFi状态。需要改成{"status": "connecting"}
    } catch (error) {
        console.error('Error getting WiFi status:', error);
        throw error;
    }
};

// 强制云同步
/**
 * 
 * @returns {
 *  "status": "success" | "failed"
 * }
 */
export const forceCloudSync = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/force-cloud-sync`)
        return response.data
    } catch (error) {
        console.error('Error forcing cloud sync:', error);
        throw error;
    }
};

// reset功能相关
/**
 * @param {string} resetSystem
 * @param {string} openBluetooth
 * @param {string} restartWifi
 * @param {string} openInternetDetectTool
 * @param {string} muted
 * @returns {
 *  "status": "success" | "failed"
 * }
 */
export const resetMenu = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/reset-menu`)
        return response.data
    } catch (error) {
        console.error('Error resetting:', error);
        throw error;
    }
};

// 提取指定图片文件
export const extractImage = async (imageUrl) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/extract-image`, {
            params: {
                imageUrl: imageUrl
            }
        })
        return response.data
    } catch (error) {
        console.error('Error extracting image:', error);
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

// 请求拦截器 - 只处理请求发送前的逻辑
pinturaApi.interceptors.request.use(
    config => {
        const token = getToken();
        if (token) {
            config.headers['X-TOKEN'] = token;
        }
        config.baseURL = getPinturaApiBaseUrl();
        return config;
    },
    error => {
        // 只处理请求发送前的错误
        return Promise.reject(error);
    }
);

// 响应拦截器 - 处理服务器响应，包括401错误
pinturaApi.interceptors.response.use(
    response => {
        // 成功响应直接返回
        return response;
    },
    error => {
        // 处理响应错误，包括401
        if (error.response && error.response.status === 401) {
            // 401 未授权，需要重新登录
            removeToken();
            alert("登录已过期，请重新登录");
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export const updateBaseUrl = (baseUrl) => {
    pinturaApi.defaults.baseURL = baseUrl;
    setPinturaApiBaseUrl(baseUrl);
}

/**
 * 登录
 * @param {string} account - 账号 (手机号/邮箱)
 * @param {string} password - 密码
 * @param {string} region - 区域 (e.g., 'CN')
 * @param {string} areaCode - 区号 (e.g., '86')
 */
export const login = async (account, password, region, areaCode) => {
    // Determine URL based on areaCode and save it for future requests
    
    const currentBaseUrl = getPinturaApiBaseUrl()
    if (currentBaseUrl != PINTURA_DEV_URL) {
        if (region === 'CN') {
            updateBaseUrl(PINTURA_CN_URL);
          } else {
            updateBaseUrl(PINTURA_US_URL);
          }
    }
    

    const loginType = account.includes('@') ? 3 : 2;
    
    const requestBody = {
        account,
        password,
        loginType,
    };

    // 只在手机号登录时添加区号
    if (loginType === 2 && areaCode) {
        requestBody.areaCode = '+' + areaCode;
    }

    console.log('Sending login request:', requestBody);
    
    try {
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
    } catch (error) {
        console.error("请求发生错误：", error)
    }
};

/**
 * 获取屏组列表
 */
export const getScreenGroupList = async () => {
    console.log('Fetching screen group list...');
    try {
        const response = await pinturaApi.get('/api/v1/host/screen/group/list');
        return response.data; // 假设返回的数据在 data 字段
    } catch(error) {
        console.error("获取屏幕组发生错误：", error)
        if (error.response.status == 401) {
            // 401 未授权，需要重新登录
            removeToken();
            return;
        }
    }
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
    try {
        const response = await pinturaApi.post('/api/v1/host/screen/group/add', requestBody);
        
        return response.data;
    } catch (error) {
        console.error("创建屏幕组发生错误：", error)
        if (error.response.status == 401) {
            // 401 未授权，需要重新登录
            removeToken();
            return;
        }
    }
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
    try {
        const response = await pinturaApi.post('/api/v1/host/screen/group/join', requestBody);
        return response.data;
    } catch (error) {
        console.error("将屏幕添加到屏幕组发生错误：", error)
        if (error.response.status == 401) {
            // 401 未授权，需要重新登录
            removeToken();
            return;
        }
    }
}; 
