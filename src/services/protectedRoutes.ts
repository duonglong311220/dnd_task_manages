import React, { type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import {jwtDecode, type JwtPayload} from "jwt-decode";

interface ProtectedRouteProps {
    children: ReactNode;
}

function isTokenExpired(token: string): boolean {
    try {
        const decoded = jwtDecode<JwtPayload>(token);
        const currentTime = Math.floor(Date.now() / 1000);

        if (!decoded.exp) return true;

        return decoded.exp < currentTime;
    } catch (error) {
        return true;
    }
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const sessionData = localStorage.getItem('session');

    const session = sessionData ? JSON.parse(sessionData) : null;
    const token = session?.access_token;

    if (!token || isTokenExpired(token)) {
        localStorage.removeItem('session');
        return React.createElement(Navigate, { to: "/", replace: true });
    }

    return React.createElement(React.Fragment, null, children);
};

export default ProtectedRoute;