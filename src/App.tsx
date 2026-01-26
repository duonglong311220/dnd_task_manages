import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAppDispatch } from './store/hooks';
import { checkAuth } from './store/slices/authSlice';

// Pages
import LoginPage from './pages/loginPage';

// Components
// import ProtectedRoute from './components/Auth/ProtectedRoute';

const App: React.FC = () => {
    const dispatch = useAppDispatch();

    useEffect(() => {
        dispatch(checkAuth());
    }, [dispatch]);

    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />

            {/* Protected Routes */}
            {/*<Route*/}
            {/*    path="/"*/}
            {/*    element={*/}
            {/*        <ProtectedRoute>*/}
            {/*            <DashboardPage />*/}
            {/*        </ProtectedRoute>*/}
            {/*    }*/}
            {/*/>*/}

            {/* Redirect unknown routes */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

export default App;

