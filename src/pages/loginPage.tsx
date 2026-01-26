import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { login, clearError } from '../store/slices/authSlice';
import { Button, Input, Card } from '../components/UI';
import { FiMail, FiLock, FiDollarSign } from 'react-icons/fi';

const LoginPage: React.FC = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { loading, error, isAuthenticated } = useAppSelector((state) => state.auth);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/');
        }
    }, [isAuthenticated, navigate]);

    useEffect(() => {
        return () => {
            dispatch(clearError());
        };
    }, [dispatch]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        dispatch(login({ email, password }));
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
                        <FiDollarSign className="text-primary-600" size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800">PayTrack</h1>
                    <p className="text-gray-500 mt-2">Đăng nhập để quản lý chi tiêu</p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                        <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <Input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="pl-10"
                            required
                        />
                    </div>

                    <div className="relative">
                        <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <Input
                            type="password"
                            placeholder="Mật khẩu"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="pl-10"
                            required
                        />
                    </div>

                    <Button type="submit" className="w-full" loading={loading}>
                        Đăng nhập
                    </Button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-gray-500">
                        Chưa có tài khoản?{' '}
                        <Link to="/register" className="text-primary-600 hover:underline font-medium">
                            Đăng ký ngay
                        </Link>
                    </p>
                </div>

                {/* Demo accounts */}
                <div className="mt-6 pt-6 border-t border-gray-100">
                    <p className="text-xs text-gray-400 text-center mb-2">Tài khoản demo:</p>
                    <p className="text-xs text-gray-500 text-center">admin@paytrack.com / admin123</p>
                </div>
            </Card>
        </div>
    );
};

export default LoginPage;

