import axios from 'axios';

// 模拟的后端API地址
const API_BASE_URL = '/api';

// 模拟一个延时函数
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 模拟获取WiFi列表
export const getWifiList = async () => {
    console.log('Fetching WiFi list...');
    await sleep(500); // 模拟网络延迟
    // 在真实应用中，这里会是 axios.get(`${API_BASE_URL}/wifi-list`)
    // 然后返回 response.data
    // 这里我们返回模拟数据
    const mockWifiList = [
        { ssid: 'MyHomeWiFi', signal: -10 },
        { ssid: 'Office-Guest', signal: -25 },
        { ssid: 'Free_Public_WiFi1', signal: -30 },
        { ssid: 'Free_Public_WiFi2', signal: -40 },
        { ssid: 'Free_Public_WiFi3', signal: -50 },
        { ssid: 'Free_Public_WiFi4', signal: -60 },
        { ssid: 'Free_Public_WiFi5', signal: -70 },
        { ssid: 'Free_Public_WiFi6', signal: -80 },
        { ssid: 'Free_Public_WiFi7', signal: -90 },
        { ssid: 'Free_Public_WiFi8', signal: -100 },
        { ssid: 'Free_Public_WiFi9', signal: -80 },
        { ssid: 'Free_Public_WiFi10', signal: -80 },
        { ssid: 'Free_Public_WiFi11', signal: -80 },
        { ssid: 'Free_Public_WiFi12', signal: -80 },
        { ssid: 'Free_Public_WiFi13', signal: -80 },
        { ssid: 'Free_Public_WiFi', signal: -80 },
        { ssid: 'Free_Public_WiFi', signal: -80 },
        { ssid: 'Free_Public_WiFi', signal: -80 },
        { ssid: 'Free_Public_WiFi', signal: -80 },
        { ssid: 'Free_Public_WiFi', signal: -80 },
        { ssid: 'Free_Public_WiFi', signal: -80 },
        { ssid: 'Free_Public_WiFi', signal: -80 },
        { ssid: 'Free_Public_WiFi', signal: -80 },
        { ssid: 'Free_Public_WiFi', signal: -80 },
        { ssid: 'Free_Public_WiFi', signal: -80 },
    ];
    console.log('Fetched WiFi list:', mockWifiList);
    return mockWifiList;
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