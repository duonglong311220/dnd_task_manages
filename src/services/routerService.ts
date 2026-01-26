import LoginPage from '../pages/loginPage';

const publicRoutes = [
    { path: '/login', component: LoginPage, isProtected: false, },
];
const privateRoutes = [];

export { publicRoutes, privateRoutes };
