import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      title: 'WiFi Configuration',
      wifiSsid: 'WiFi Name',
      wifiPassword: 'Password',
      connect: 'Connect',
      confirmPassword: 'Confirm Password',
      confirmPasswordPrompt: 'Please confirm that the password is correct.',
      connecting: 'Connecting...',
      statusSuccess: '🎉🎉🎉Configuration successful!',
      statusPasswordError: 'Password error, please try again.',
      statusTimeout: 'Connection timed out, please check your network.',
      statusError: 'Configuration failed, please try again later.',
      ok: 'OK',
      cancel: 'Cancel',
      passwordRequired: 'Password cannot be empty.',
      retry: 'Retry',
      noWifiFound: 'Oops, no WiFi networks detected nearby. Please move the Pintura device closer to the router.',
    },
  },
  zh: {
    translation: {
      title: 'WiFi热点配网',
      wifiSsid: 'WiFi名称',
      wifiPassword: '密码',
      connect: '开始配网',
      confirmPassword: '确认密码',
      confirmPasswordPrompt: '请确认密码是否正确。',
      connecting: '连接中...',
      statusSuccess: '🎉🎉🎉配网成功！',
      statusPasswordError: '密码错误，请重试。',
      statusTimeout: '连接超时，请检查您的网络。',
      statusError: '配网失败，请稍后重试。',
      ok: '确认',
      cancel: '取消',
      passwordRequired: '密码不能为空。',
      retry: '重试',
      noWifiFound: '┗|｀O′|┛ 嗷~~，未检测到附近的WiFi，请将Pintura设备尽量靠近路由器。',
    },
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'zh', // 默认语言
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n; 