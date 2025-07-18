import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import Select, { components } from 'react-select';
import * as flags from 'country-flag-icons/react/3x2';
import { login, getAccount } from '../api';
import Modal, { ModalButton } from '../components/common/Modal'; // Import Modal
import { useAppContext } from '../components/AppContext'; // 引入 useAppContext
// By importing from `/max`, we get the most accurate validation and parsing.
// This resolves ambiguity issues between country number formats.
import parsePhoneNumberFromString, { getCountries } from 'libphonenumber-js/max';
import ThemeSwitcher from '../components/LanguageSwitcher';
import countries from 'i18n-iso-countries';
import enLocale from 'i18n-iso-countries/langs/en.json';
import zhLocale from 'i18n-iso-countries/langs/zh.json';


// Register the languages
countries.registerLocale(enLocale);
countries.registerLocale(zhLocale);

// 常用国家列表，优先显示
const COMMON_COUNTRIES = ['CN', 'US', 'JP', 'KR', 'GB', 'DE', 'FR', 'AU', 'CA', 'SG', 'HK', 'TW', 'IN', 'BR', 'RU'];

// 本地 SVG 旗帜组件
const CountryFlag = React.memo(({ countryCode, size = 20 }) => {
  if (!countryCode) {
    return (
      <span 
        style={{ 
          fontSize: size * 0.6,
          display: 'inline-block',
          width: size,
          height: size * 0.75,
          textAlign: 'center',
          lineHeight: `${size * 0.75}px`,
          backgroundColor: '#f0f0f0',
          border: '1px solid #ddd',
          borderRadius: '2px',
          color: '#666'
        }}
      >
        ??
      </span>
    );
  }
  
  // 获取对应的旗帜组件
  const FlagComponent = flags[countryCode.toUpperCase()];
  
  if (!FlagComponent) {
    // 如果没有找到对应的旗帜，显示国家代码
    return (
      <span 
        style={{ 
          fontSize: size * 0.6,
          display: 'inline-block',
          width: size,
          height: size * 0.75,
          textAlign: 'center',
          lineHeight: `${size * 0.75}px`,
          backgroundColor: '#f0f0f0',
          border: '1px solid #ddd',
          borderRadius: '2px',
          color: '#666'
        }}
      >
        {countryCode}
      </span>
    );
  }
  
  return (
    <div
      style={{
        width: size,
        height: size * 0.75,
        display: 'inline-block',
        borderRadius: '2px',
        border: '1px solid #ddd',
        overflow: 'hidden'
      }}
    >
      <FlagComponent 
        width={size} 
        height={size * 0.75}
        style={{ 
          display: 'block',
          objectFit: 'cover'
        }}
      />
    </div>
  );
});

CountryFlag.displayName = 'CountryFlag';

const LoginPageContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 20px;
  background-color: ${props => props.$isDarkMode ? '#000000' : '#f0f2f5'};
  transition: background-color 0.3s ease;
`;

const FormContainer = styled.div`
  background: ${props => props.$isDarkMode ? '#1C1C1E' : 'white'};
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, ${props => props.$isDarkMode ? 0.4 : 0.1});
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  position: relative;
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
`;

const TopRightContainer = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
  z-index: 10;
  
  @media (max-width: 480px) {
    top: 0.8rem;
    right: 0.8rem;
  }
`;

const HeaderSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60px;
  padding-right: 70px; /* 为右上角按钮留出更多空间 */
  
  @media (max-width: 480px) {
    padding-right: 80px; /* 移动设备上留出更多空间 */
    min-height: 50px;
  }
`;

const Title = styled.h1`
    text-align: center;
    color: ${props => props.$isDarkMode ? '#e0e0e0' : '#333'};
    transition: color 0.3s ease;
    margin: 0;
    flex: 1;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  margin-bottom: 0.5rem;
  font-weight: bold;
  font-size: 1rem;
  color: ${props => props.$isDarkMode ? '#e0e0e0' : '#333'};
  transition: color 0.3s ease;
`;

const Input = styled.input`
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid ${props => props.$hasError ? '#d93025' : (props.$isDarkMode ? '#555' : '#ccc')};
  font-size: 1rem;
  width: 100%;
  background-color: ${props => props.$isDarkMode ? '#444' : '#fff'};
  color: ${props => props.$isDarkMode ? '#e0e0e0' : '#333'};
  transition: background-color 0.3s ease, color 0.3s ease;
  &:focus {
    outline: none;
    border-color: ${props => props.$hasError ? '#d93025' : 'hsl(172.61deg 100% 41.37%)'};
    box-shadow: 0 0 0 2px ${props => props.$hasError ? 'rgba(217, 48, 37, 0.25)' : 'rgba(0, 123, 255, 0.25)'};
  }
`;

const Button = styled(motion.button)`
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  border: none;
  background-color: hsl(172.61deg 100% 41.37%);
  color: white;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  width: 100%;
  transition: background-color 0.3s ease;

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const ErrorText = styled.p`
  color: #d93025;
  font-size: 0.875rem;
  min-height: 1rem;
  margin-top: 0.5rem;
`;

const InputGroup = styled.div`
  display: flex;
  align-items: center;
  border: 1px solid ${props => props.$isDarkMode ? '#555' : '#ccc'};
  border-radius: 8px;
  transition: border-color 0.2s, box-shadow 0.2s, background-color 0.3s ease;
  position: relative; // Needed for positioning the clear button
  background-color: ${props => props.$isDarkMode ? '#444' : '#fff'};

  &:focus-within {
    border-color: hsl(172.61deg 100% 41.37%);
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
  }
`;

const ClearButton = styled.button`
    background: transparent;
    border: none;
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    cursor: pointer;
    color: #999;
    font-size: 1.5rem;
    padding: 0 5px;

    &:hover {
        color: #333;
    }
`;

const CountryCodeAddon = styled.span`
  padding: 0.75rem;
  color: ${props => props.$isDarkMode ? '#ccc' : '#666'};
  background-color: ${props => props.$isDarkMode ? '#3a3a3a' : '#f7f7f7'};
  border-right: 1px solid ${props => props.$isDarkMode ? '#555' : '#ccc'};
  border-top-left-radius: 8px;
  border-bottom-left-radius: 8px;
  white-space: nowrap;
  transition: background-color 0.3s ease, color 0.3s ease;
`;

const GroupedInput = styled(Input)`
  border: none;
  flex-grow: 1;
  border-radius: ${props => props.$hasCountryCode ? '0 8px 8px 0' : '8px'};
  background-color: transparent; /* 使用透明背景，继承父容器的背景色 */
  transition: background-color 0.3s ease, color 0.3s ease;
  &:focus {
    box-shadow: none;
  }
`;

const CountryOptionContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Option = (props) => (
  <components.Option {...props}>
    {props.data.value === 'divider' ? (
      <div style={{ textAlign: 'center', padding: '4px 0' }}>
        <span style={{ color: '#999' }}>{props.label}</span>
      </div>
    ) : (
      <CountryOptionContainer>
        <CountryFlag 
          countryCode={props.value} 
          size={24}
        />
        <span>{props.label}</span>
      </CountryOptionContainer>
    )}
  </components.Option>
);

const SingleValue = ({ children, ...props }) => (
    <components.SingleValue {...props}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CountryFlag 
              countryCode={props.data.value} 
              size={24}
            />
            {children}
        </div>
    </components.SingleValue>
);

// 优化的菜单列表组件
const OptimizedMenuList = (props) => {
  const { children, maxHeight = 200 } = props;
  
  if (!children || !Array.isArray(children)) {
    return <components.MenuList {...props} />;
  }

  // 限制最大高度，启用滚动
  return (
    <components.MenuList 
      {...props} 
      style={{ 
        maxHeight: maxHeight, 
        overflowY: 'auto',
        // 优化滚动性能
        scrollBehavior: 'smooth'
      }}
    >
      {children}
    </components.MenuList>
  );
};


function Login() {
  const [userInput, setUserInput] = useState('');
  const [nationalNumber, setNationalNumber] = useState('');
  const [countryCode, setCountryCode] = useState('');
  const [password, setPassword] = useState('');
  const [region, setRegion] = useState('CN'); // Default to China
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [isRedirectModalOpen, setIsRedirectModalOpen] = useState(false);
  const navigate = useNavigate();
  const { i18n, t } = useTranslation();
  const { isDarkMode } = useAppContext(); // 获取 isDarkMode
  const accountInputRef = useRef(null);
  const PINTURA_CN_URL = 'http://cloud-service.austinelec.com:8080';
  const PINTURA_US_URL = 'http://cloud-service-us.austinelec.com:8080';
  const PINTURA_DEV_URL = 'http://139.224.192.36:8082';

  useEffect(() => {
    const savedAccount = getAccount();
    if (savedAccount) {
        setUserInput(savedAccount);
        setNationalNumber(savedAccount); // Also set the visual part
    }
  }, []);

  const handleClearInput = () => {
    setUserInput('');
    setNationalNumber('');
    setCountryCode('');
    setPhoneError('');
  };

  const countryOptions = useMemo(() => {
    const currentLang = i18n.language.startsWith('zh') ? 'zh' : 'en';
    const countryNames = countries.getNames(currentLang, { select: 'official' });
    
    // 获取所有国家
    const allCountries = getCountries();
    
    // 分离常用国家和其他国家
    const commonCountries = COMMON_COUNTRIES.filter(code => allCountries.includes(code));
    const otherCountries = allCountries.filter(code => !COMMON_COUNTRIES.includes(code));
    
    // 创建国家选项
    const createCountryOption = (code) => ({
      value: code,
      label: countryNames[code] || code,
    });
    
    // 常用国家按预设顺序排列
    const commonOptions = commonCountries.map(createCountryOption);
    
    // 其他国家按字母排序
    const otherOptions = otherCountries
      .map(createCountryOption)
      .sort((a, b) => a.label.localeCompare(b.label));
    
    // 合并并添加分隔符
    return [
      ...commonOptions,
      { value: 'divider', label: '──────────', isDisabled: true },
      ...otherOptions
    ];
  }, [i18n.language]);

  const handleAccountBlur = () => {
    if (!userInput || userInput.includes('@')) {
      setCountryCode('');
      setPhoneError('');
      return;
    }

    const phoneNumber = parsePhoneNumberFromString(userInput, region);

    if (phoneNumber && phoneNumber.isValid()) {
      setCountryCode(`+${phoneNumber.countryCallingCode}`);
      setNationalNumber(phoneNumber.nationalNumber);
      setPhoneError('');
    } else {
      setCountryCode('');
      setNationalNumber(userInput);
      setPhoneError(t('invalidPhoneNumber'));
    }
  };

  const handleAccountChange = (e) => {
    const newDisplayedValue = e.target.value;
    setPhoneError(''); // Clear error on new input

    if (newDisplayedValue === '') {
      setUserInput('');
      setNationalNumber('');
      setCountryCode('');
      return;
    }
    
    setNationalNumber(newDisplayedValue);
    setUserInput(newDisplayedValue);
  };

  const handleRegionChange = (selectedOption) => {
    const newRegion = selectedOption.value;
    setRegion(newRegion);
    setPhoneError('');

    const phoneNumber = parsePhoneNumberFromString(userInput, newRegion);
    if (phoneNumber && phoneNumber.isValid()) {
      setCountryCode(`+${phoneNumber.countryCallingCode}`);
      setNationalNumber(phoneNumber.nationalNumber);
    } else {
      setCountryCode('');
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    
    // 检查密码是否已输入
    if (!password) {
      setError(t('passwordRequired'));
      return;
    }
    
    // Re-validate before submitting
    if (userInput && !userInput.includes('@')) {
        const phoneNumber = parsePhoneNumberFromString(userInput, region);
        if (!phoneNumber || !phoneNumber.isValid()) {
            setPhoneError(t('invalidPhoneNumber'));
            return;
        }
    }

    setIsLoading(true);
    setError('');

    try {
      
      const response = await login(userInput, password, region, countryCode.replace('+', ''));
      
      // Manually check for business logic errors returned in a 200 response
      if (response && response.code === 37) {
        const error = new Error(response.message);
        error.response = { data: response }; // Mimic axios error structure
        throw error;
      }
      
      // 检查密码错误 (code 38)
      if (response && response.code === 38) {
        setError(t('passwordError'));
        return;
      }

      navigate('/create-groups');
    } catch (err) {
      if (err.response && (err.response.data.code === 'USER_NOT_EXIST' || err.response.data.code === 37)) {
        setIsRedirectModalOpen(true);
      } else if (err.response && err.response.data.code === 38) {
        setError(t('passwordError'));
      } else {
        setError(t('loginError'));
        console.error("err", err)
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckAccount = () => {
    setIsRedirectModalOpen(false);
    accountInputRef.current?.focus();
  };

  const handleGoToRegister = () => {
    setIsRedirectModalOpen(false);
    window.location.href = 'https://pintura.com.cn/login';
  };

  const selectStyles = {
    control: (provided, state) => ({
      ...provided,
      padding: '0.3rem',
      borderRadius: '8px',
      backgroundColor: isDarkMode ? '#333' : '#fff',
      borderColor: isDarkMode ? '#555' : '#ccc',
      boxShadow: state.isFocused ? '0 0 0 1px hsl(172.61deg 100% 41.37%)' : 'none',
      '&:hover': {
        borderColor: isDarkMode ? '#666' : '#b3b3b3',
      }
    }),
    option: (provided, state) => ({
      ...provided,
      display: 'flex',
      alignItems: 'center',
      backgroundColor: state.isSelected ? 'hsl(172.61deg 100% 41.37%)' : (isDarkMode ? '#333' : '#fff'),
      color: isDarkMode ? '#e0e0e0' : '#333',
      '&:hover': {
        backgroundColor: isDarkMode ? 'hsl(172.61deg 100% 31.37%)' : '#e6e6e6',
      },
      // 分隔符样式
      ...(state.data?.value === 'divider' && {
        backgroundColor: 'transparent',
        color: isDarkMode ? '#666' : '#999',
        cursor: 'default',
        '&:hover': {
          backgroundColor: 'transparent',
        }
      })
    }),
    singleValue: (provided) => ({
      ...provided,
      color: isDarkMode ? '#e0e0e0' : '#333',
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: isDarkMode ? '#333' : '#fff',
    }),
  };

  return (
    <LoginPageContainer
        $isDarkMode={isDarkMode}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
    >
      <FormContainer $isDarkMode={isDarkMode}>
        <TopRightContainer>
            <ThemeSwitcher />
        </TopRightContainer>
        <HeaderSection>
          <Title $isDarkMode={isDarkMode}>{t('loginTitle')}</Title>
        </HeaderSection>
        <form onSubmit={handleLogin}>
            <FormGroup>
                <Label htmlFor="region" style={{marginBottom: '2%'}} $isDarkMode={isDarkMode}>{t('region')}</Label>
                 <Select
                    id="region"
                    value={countryOptions.find(opt => opt.value === region)}
                    onChange={handleRegionChange}
                    options={countryOptions}
                    isDisabled={isLoading}
                    components={{ 
                      Option, 
                      SingleValue,
                      MenuList: OptimizedMenuList
                    }}
                    styles={selectStyles}
                    maxMenuHeight={260}
                    menuPlacement="auto"
                />
            </FormGroup>
            <FormGroup>
                <Label htmlFor="account" style={{marginTop: '2%'}} $isDarkMode={isDarkMode}>{t('account')}</Label>
                <InputGroup $isDarkMode={isDarkMode}>
                    {countryCode && <CountryCodeAddon $isDarkMode={isDarkMode}>{countryCode}</CountryCodeAddon>}
                    <GroupedInput
                        id="account"
                        type="text"
                        $hasCountryCode={!!countryCode}
                        $isDarkMode={isDarkMode}
                        value={nationalNumber}
                        onChange={handleAccountChange}
                        onBlur={handleAccountBlur}
                        placeholder={t('accountPlaceholder')}
                        disabled={isLoading}
                        ref={accountInputRef}
                    />
                    {nationalNumber && !isLoading && (
                        <ClearButton onClick={handleClearInput} type="button">
                            &times;
                        </ClearButton>
                    )}
                </InputGroup>
                {phoneError && <ErrorText>{phoneError}</ErrorText>}
            </FormGroup>
            <FormGroup>
                <Label htmlFor="password" $isDarkMode={isDarkMode}>{t('password')}</Label>
                <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => {
                        setPassword(e.target.value);
                        // 清除密码相关的错误消息
                        if (error === t('passwordError') || error === t('passwordRequired')) {
                            setError('');
                        }
                    }}
                    disabled={isLoading}
                    $isDarkMode={isDarkMode}
                    $hasError={!!error && (error === t('passwordError') || error === t('passwordRequired'))}
                />
                <ErrorText>{error || ' '}</ErrorText>
            </FormGroup>
            <Button type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} disabled={isLoading || !!phoneError}>
                {isLoading ? t('loggingIn') : t('loginButton')}
            </Button>
        </form>
         <Modal
            isOpen={isRedirectModalOpen}
            onClose={() => setIsRedirectModalOpen(false)}
            title={t('userNotFoundTitle')}
            isDarkMode={isDarkMode}
        >
            <div>
                <p>{t('userNotFoundMessage')}</p>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                    <ModalButton onClick={handleCheckAccount}>{t('checkAccountButton')}</ModalButton>
                    <ModalButton onClick={handleGoToRegister} primary>{t('registerButton')}</ModalButton>
                </div>
            </div>
        </Modal>
      </FormContainer>
    </LoginPageContainer>
  );
}

export default Login; 