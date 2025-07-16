import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import Select, { components } from 'react-select';
import ReactCountryFlag from 'react-country-flag';
import { login, getAccount } from '../api';
import Modal, { ModalButton } from '../components/common/Modal'; // Import Modal
// By importing from `/max`, we get the most accurate validation and parsing.
// This resolves ambiguity issues between country number formats.
import parsePhoneNumberFromString, { getCountries } from 'libphonenumber-js/max';
import LanguageSwitcher from '../components/LanguageSwitcher';
import countries from 'i18n-iso-countries';
import enLocale from 'i18n-iso-countries/langs/en.json';
import zhLocale from 'i18n-iso-countries/langs/zh.json';


// Register the languages
countries.registerLocale(enLocale);
countries.registerLocale(zhLocale);

const LoginPageContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 20px;
  background-color: #f0f2f5;
`;

const FormContainer = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  position: relative; /* Added for positioning the language switcher */
`;

const TopRightContainer = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
`;

const Title = styled.h1`
    text-align: center;
    color: #333;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  margin-bottom: 0.5rem;
  font-weight: bold;
  font-size: 1rem;
  color: #333;
`;

const Input = styled.input`
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid ${props => props.$hasError ? '#d93025' : '#ccc'};
  font-size: 1rem;
  width: 100%;
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
  border: 1px solid #ccc;
  border-radius: 8px;
  transition: border-color 0.2s, box-shadow 0.2s;
  position: relative; // Needed for positioning the clear button

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
  color: #666;
  background-color: #f7f7f7;
  border-right: 1px solid #ccc;
  border-top-left-radius: 8px;
  border-bottom-left-radius: 8px;
  white-space: nowrap;
`;

const GroupedInput = styled(Input)`
  border: none;
  flex-grow: 1;
  border-radius: ${props => props.$hasCountryCode ? '0 8px 8px 0' : '8px'};

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
    <CountryOptionContainer>
      <ReactCountryFlag countryCode={props.value} svg style={{ width: '1.5em', height: '1.5em' }} />
      <span>{props.label}</span>
    </CountryOptionContainer>
  </components.Option>
);

const SingleValue = ({ children, ...props }) => (
    <components.SingleValue {...props}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ReactCountryFlag countryCode={props.data.value} svg style={{ width: '1.5em', height: '1.5em' }} />
            {children}
        </div>
    </components.SingleValue>
);


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
  const accountInputRef = useRef(null);

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
    return getCountries()
      .map(code => ({
        value: code,
        label: countryNames[code] || code,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
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
      const response = await login(userInput, password, countryCode.replace('+', ''));
      
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
    control: (provided) => ({
        ...provided,
        padding: '0.3rem',
        borderRadius: '8px',
        border: '1px solid #ccc',
        boxShadow: 'none',
        '&:hover': {
            borderColor: '#ccc',
        }
    }),
    option: (provided) => ({
        ...provided,
        display: 'flex',
        alignItems: 'center',
    }),
  };

  return (
    <LoginPageContainer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
    >
      <FormContainer>
        <TopRightContainer>
            <LanguageSwitcher />
        </TopRightContainer>
        <Title>{t('loginTitle')}</Title>
        <form onSubmit={handleLogin}>
            <FormGroup>
                <Label htmlFor="region" style={{marginBottom: '2%'}}>{t('region')}</Label>
                 <Select
                    id="region"
                    value={countryOptions.find(opt => opt.value === region)}
                    onChange={handleRegionChange}
                    options={countryOptions}
                    isDisabled={isLoading}
                    components={{ Option, SingleValue }}
                    styles={selectStyles}
                />
            </FormGroup>
            <FormGroup>
                <Label htmlFor="account" style={{marginTop: '2%'}}>{t('account')}</Label>
                <InputGroup>
                    {countryCode && <CountryCodeAddon>{countryCode}</CountryCodeAddon>}
                    <GroupedInput
                        id="account"
                        type="text"
                        $hasCountryCode={!!countryCode}
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
                <Label htmlFor="password" style={{marginTop: '2%'}}>{t('password')}</Label>
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
                    $hasError={!!error && (error === t('passwordError') || error === t('passwordRequired'))}
                />
            </FormGroup>
            <ErrorText>{error}</ErrorText>
            <Button type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} disabled={isLoading || !!phoneError}>
                {isLoading ? t('loggingIn') : t('loginButton')}
            </Button>
        </form>
         <Modal
            isOpen={isRedirectModalOpen}
            onClose={() => setIsRedirectModalOpen(false)}
            title={t('userNotFoundTitle')}
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