import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { getScreenId, getScreenGroupList, createScreenGroup, joinScreenGroup } from '../api';
import { useTranslation } from 'react-i18next';

const PageContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  background-color: #f0f2f5;
  min-height: 100vh;
`;

const ContentCard = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 600px;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const Title = styled.h1`
  text-align: center;
  color: #333;
`;

const ScreenIdDisplay = styled.div`
  background-color: #e9ecef;
  color: #495057;
  padding: 0.75rem 1.25rem;
  border-radius: 8px;
  text-align: center;
  font-weight: 500;
  font-family: 'Courier New', Courier, monospace;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
`;

const Button = styled(motion.button)`
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  border: 1px solid hsl(172.61deg 100% 41.37%);
  background-color: ${props => (props.primary ? 'hsl(172.61deg 100% 41.37%)' : 'white')};
  color: ${props => (props.primary ? 'white' : 'hsl(172.61deg 100% 41.37%)')};
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  width: 100%;
  &:disabled {
    background-color: #ccc;
    border-color: #ccc;
    cursor: not-allowed;
  }
`;

const Input = styled.input`
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid #ccc;
  font-size: 1rem;
  width: 100%;
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
    padding: 1rem;
    border-bottom: 1px solid #eee;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
    &:last-child {
        border-bottom: none;
    }
    &:hover {
        background-color: #f7f7f7;
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
    const [view, setView] = useState('loading'); // loading, initial, create, select
    const [newGroupName, setNewGroupName] = useState('');
    const { t } = useTranslation();

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
                setView(list.length === 0 ? 'create' : 'initial');
            } catch (error) {
                console.error("Failed to fetch initial data:", error);
                setView('initial'); // Fallback view
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleCreateGroup = async () => {
        if (!newGroupName.trim() || !screenId) return;
        setIsLoading(true);
        try {
            await createScreenGroup(newGroupName, screenId);
            alert(t('groupCreatedSuccess'));
            setNewGroupName('');
            const groups = await getScreenGroupList();
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
            await joinScreenGroup(groupId, screenId);
            alert(t('groupJoinedSuccess')); // New translation key needed
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
                        />
                        <Button primary onClick={handleCreateGroup} disabled={isLoading}>{t('confirmCreation')}</Button>
                    </>
                );
            case 'select':
                return (
                    <GroupList>
                        {groupList.map(group => (
                            <GroupListItem key={group.id} onClick={() => handleJoinGroup(group.id)}>
                                <span>{group.name}</span>
                                <ScreenCount>{group.screenCount} {t('screens')}</ScreenCount>
                            </GroupListItem>
                        ))}
                    </GroupList>
                );
            case 'initial':
                return (
                    <ButtonGroup>
                        <Button onClick={() => setView('create')}>{t('createNewGroup')}</Button>
                        <Button onClick={() => setView('select')}>{t('addToExistingGroup')}</Button>
                    </ButtonGroup>
                );
            default:
                return null;
        }
    };

    return (
        <PageContainer initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            <ContentCard>
                <Title>{t('createGroupTitle')}</Title>
                <ScreenIdDisplay>
                    {t('screenIdLabel')}: {screenId || t('loading')}
                </ScreenIdDisplay>
                {renderContent()}
            </ContentCard>
        </PageContainer>
    );
}

export default CreateGroups; 