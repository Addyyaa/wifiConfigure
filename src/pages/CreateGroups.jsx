import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { getScreenId, getScreenGroupList, createScreenGroup, joinScreenGroup } from '../api';
import { useAppContext } from '../components/AppContext';

const PageContainer = styled(motion.div)`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
  background-color: ${props => props.$isDarkMode ? '#000000' : '#f0f2f5'};
  transition: background-color 0.3s ease;
`;

const ContentCard = styled.div`
  background: ${props => props.$isDarkMode ? '#1C1C1E' : 'white'};
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, ${props => props.$isDarkMode ? 0.4 : 0.1});
  width: 100%;
  max-width: 500px;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
`;

const Title = styled.h1`
  text-align: center;
  color: ${props => props.$isDarkMode ? '#e0e0e0' : '#333'};
  transition: color 0.3s ease;
  margin: 0;
`;

const ScreenIdDisplay = styled.p`
  color: ${props => props.$isDarkMode ? '#b0b0b0' : '#666'};
  font-size: 0.9rem;
  text-align: center;
  margin-top: -10px;
  transition: color 0.3s ease;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  border: none;
  background-color: ${props => props.primary ? 'hsl(172.61deg 100% 41.37%)' : (props.$isDarkMode ? '#333' : '#e0e0e0')};
  color: ${props => props.primary ? 'white' : (props.$isDarkMode ? '#e0e0e0' : '#333')};
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease, color 0.3s ease;

  &:disabled {
    background-color: #555;
    color: #888;
    cursor: not-allowed;
  }
`;

const Input = styled.input`
  padding: 0.75rem;
  border-radius: 8px;
  font-size: 1rem;
  width: 100%;
  background-color: ${props => props.$isDarkMode ? '#333' : '#fff'};
  color: ${props => props.$isDarkMode ? '#e0e0e0' : '#333'};
  border: 1px solid ${props => props.$isDarkMode ? '#555' : '#ccc'};
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: hsl(172.61deg 100% 41.37%);
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
  }
`;

const GroupList = styled.ul`
    list-style: none;
    padding: 0;
    margin: 0;
    max-height: 300px;
    overflow-y: auto;
    border: 1px solid #eee;
    border-radius: 8px;
`;

const GroupListItem = styled.li`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: ${props => props.$isDarkMode ? '#333' : '#f9f9f9'};
  color: ${props => props.$isDarkMode ? '#e0e0e0' : '#333'};
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: ${props => props.$isDarkMode ? 'hsl(172.61deg 100% 31.37%)' : 'hsl(172.61deg 100% 90%)'};
  }
`;

const ScreenCount = styled.span`
    color: #6c757d;
    font-size: 0.9rem;
    background-color: #e9ecef;
    padding: 2px 8px;
    border-radius: 10px;
`;


function CreateGroups() {
    const [screenId, setScreenId] = useState('');
    const [groupList, setGroupList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [view, setView] = useState('initial'); // loading, initial, create, select
    const [newGroupName, setNewGroupName] = useState('');
    const { t } = useTranslation();
    const { screenId: contextScreenId, isDarkMode } = useAppContext(); // 获取 isDarkMode

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [id, groups] = await Promise.all([
                    getScreenId(),
                    getScreenGroupList()
                ]);
                setScreenId(id);
                const list = groups?.data || [];
                setGroupList(list);
                // setView(list.length > 0 ? 'select' : 'create');  // 如果有屏幕组则自动进入添加到已有屏幕组页面
            } catch (error) {
                console.error('Error fetching data:', error);
                // Handle error appropriately
            } finally {
                setIsLoading(false);  
            }
        };
        fetchData();
    }, [setScreenId]);

    const handleCreateGroup = async () => {
        if (!newGroupName.trim() || !screenId) return;
        setIsLoading(true);
        try {
            const response = await createScreenGroup(newGroupName, screenId); // Changed from createScreenGroup to createGroup
            if (response != null) {
                alert(t('groupCreatedSuccess'));
            } else {
                return;
            }
            setNewGroupName('');
            const groups = await getScreenGroupList(); // Changed from getScreenGroupList to getGroups
            const list = groups?.data || [];
            setGroupList(list);
            setView(list.length === 0 ? 'create' : 'initial');
        } catch (error) {
            console.error("Failed to create group:", error);
            alert(t('groupCreatedError'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleJoinGroup = async (groupId) => {
        if (!screenId) return;
        setIsLoading(true);
        try {
            const response = await joinScreenGroup(groupId, screenId); // Changed from joinScreenGroup to joinGroup
            if (response != null) {
                alert(t('groupJoinedSuccess')); // New translation key needed
            } else {
                return;
            }
        } catch (error) {
            console.error("Failed to join group:", error);
            alert(t('groupJoinedError')); // New translation key needed
        } finally {
            setIsLoading(false);
        }
    };
    
    const renderContent = () => {
        if (isLoading && view === 'loading') {
            return <p>{t('loading')}</p>;
        }

        switch (view) {
            case 'create':
                return (
                    <>
                        <Input 
                            type="text"
                            placeholder={t('createGroupPlaceholder')}
                            value={newGroupName}
                            onChange={(e) => setNewGroupName(e.target.value)}
                            $isDarkMode={isDarkMode}
                        />
                        <Button primary onClick={handleCreateGroup} disabled={isLoading} $isDarkMode={isDarkMode}>{t('confirmCreation')}</Button>
                    </>
                );
            case 'select':
                return (
                    <GroupList>
                        {groupList.map(group => (
                            <GroupListItem key={group.id} onClick={() => handleJoinGroup(group.id)} $isDarkMode={isDarkMode}>
                                <span>{group.name}</span>
                                <ScreenCount>{group.screenCount} {t('screens')}</ScreenCount>
                            </GroupListItem>
                        ))}
                    </GroupList>
                );
            case 'initial':
                return (
                    <ButtonGroup>
                        <Button onClick={() => setView('create')} $isDarkMode={isDarkMode}>{t('createNewGroup')}</Button>
                        <Button onClick={() => setView('select')} $isDarkMode={isDarkMode}>{t('addToExistingGroup')}</Button>
                    </ButtonGroup>
                );
            default:
                return null;
        }
    };

    return (
        <PageContainer $isDarkMode={isDarkMode} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            <ContentCard $isDarkMode={isDarkMode}>
                <Title $isDarkMode={isDarkMode}>{t('createGroupTitle')}</Title>
                <ScreenIdDisplay $isDarkMode={isDarkMode}>
                    {t('screenIdLabel')}: {screenId || t('loading')}
                </ScreenIdDisplay>
                {renderContent()}
            </ContentCard>
        </PageContainer>
    );
}

export default CreateGroups; 