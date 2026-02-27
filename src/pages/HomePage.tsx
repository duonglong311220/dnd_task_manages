import React from 'react';
import { MainLayout } from '../components/Layout';
import { KanbanBoard } from '../components/Kanban';

const HomePage: React.FC = () => {
    return (
        <MainLayout>
            <KanbanBoard />
        </MainLayout>
    );
};

export default HomePage;
