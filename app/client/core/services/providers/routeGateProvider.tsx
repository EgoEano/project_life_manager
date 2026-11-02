// import React from 'react';
// import { useSelector } from 'react-redux';
// import { Navigate } from 'react-router-dom'; // Или ваш роутер

// interface RouteGateProps {
//     node: RouteNode;
//     children: React.ReactNode;
// }

// export const RouteGate: React.FC<RouteGateProps> = ({ node, children }) => {
//     const auth = useSelector((state: RootState) => state.auth);
//     const userRole = useSelector((state: RootState) => state.user.role);

//     if (!node.guards || node.guards.length === 0) {
//         return <>{children}</>;
//     }

//     for (const guard of node.guards) {
//         switch (guard.type) {
//             case 'auth':
//                 if (!auth.isAuthenticated) {
//                     return <Navigate to={guard.redirect} replace />;
//                 }
//                 break;
                
//             case 'role':
//                 if (!guard.requirements.includes(userRole)) {
//                     return <Navigate to={guard.redirect} replace />;
//                 }
//                 break;
//         }
//     }

//     return <>{children}</>;
// };

// react + redux. Нужно создать провайдер routeGate что будет перенаправлять маршруты. 
// Допустим есть тип - export type RouteNode = {
//     path: string;
//     serverBasePath?: string; // Use only in appRoot node for server base name
//     name?: string; // Optional: explicit mobile screen name (auto-generated if not provided)
//     component?: React.ComponentType<unknown>;
//     children?: RouteNode[];
//     optionsNavigator?: NavigatorOptions;
//     options?: unknown;
// }; - с примером - const mainRoutes: RouteNode = {
//     path: 'profile',
//     optionsNavigator: {
//         type: 'tabs',
//         options: {
//             headerShown: false,
//         },
//     },
//     children: [
//         {
//             path: '',
//             name: 'Main',
//             component: DashboardScreen,
//         },
//         {
//             path: 'dashboard',
//             name: 'Dashboard',
//             component: DashboardScreen,
//         },
//     ],
// };. 
// Нужно расширить тип, добавив поле, по примеру - guards: [
//   {
//     type: 'auth',
//     redirect: '/auth/login',
//   },
//   {
//     type: 'role',
//     redirect: '/403',
//   }
// ]. 
// Сами условия будут жить в redux. 
// Однако уже есть store для бизнес логики, и встал вопрос - расширить текущий, или для системы создать свой отдельный?