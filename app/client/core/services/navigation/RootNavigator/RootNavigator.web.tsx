import React, { Suspense, useEffect, useMemo } from 'react';
import { Routes, Route, useNavigate, NavigateFunction, HashRouter, BrowserRouter, useLocation } from 'react-router-dom';
import { Navigator } from '../navigationService';
import { PlaceholderScreen } from '../../../ui/components/navigationComponents';
import { RouteNode } from '../../../types/types';
import { NavigationAdapter, NavigationAdapterRoute } from '../../../types/navigation';
import routes from '../../../../modules/routes';


export default function RootNavigator() {
    const isInline = 
        Boolean(process.env.INLINE) === true 
        || process.env.INLINE === 'true';


    return isInline ? (
        <HashRouter>
            {/* <NavigationBridge /> */}
            <InitNavigator rootNode={routes} />
        </HashRouter>
    ) : (
        <BrowserRouter basename={routes.serverBasePath}>
            {/* <NavigationBridge /> */}
            <InitNavigator rootNode={routes} />
        </BrowserRouter>
    );
}

function InitNavigator({ rootNode }: { rootNode: RouteNode }) {
    const navigate = useNavigate();
    const location = useLocation();
    const memoizedRoutes = useMemo(() => renderNode(rootNode), [rootNode]);

    useEffect(() => {
        Navigator.setAdapter(createNavigationAdapter(navigate));
    }, [navigate]);
    useEffect(() => {
        Navigator.updateRoute({
            name: location.pathname, 
            params: location.state || {}, 
            key: location.key, 
        });
    }, [location]);

    return (
        <Routes>
            {memoizedRoutes}
            <Route
                path="*"
                element={<PlaceholderScreen name="Not Found" />}
            />
        </Routes>
    );
}

function renderNode(node: RouteNode): React.ReactNode {
    if (node.children && Array.isArray(node.children) && node.children.length > 0) {
        return (
            <Route
                key={node.path}
                path={node.path}
            >
                {node.children.map((child) => renderNode(child))}
                {node.component && (
                    <Route index element={<LazyWrapper component={node.component} />} />
                )}
            </Route>
        );
    }

    if (node.component) {
        return (
            <Route
                key={node.path}
                path={node.path}
                element={<LazyWrapper component={node.component} />}
            />
        );
    }

    throw new Error('RootNavigator. Incorrect node');
}

function LazyWrapper({
    component: Component,
}: {
    component: React.ComponentType;
}) {
    return (
        <Suspense fallback={<PlaceholderScreen name="Loading..." />}>
            <Component />
        </Suspense>
    );
}

function createNavigationAdapter(navigate: NavigateFunction): NavigationAdapter {

    return {
        navigate: (route: NavigationAdapterRoute, params?: any) => {
            const targetPath = route.path.startsWith('/') ? route.path : `/${route.path}`;
            if (params) {
                navigate(targetPath, { state: params });
            } else {
                navigate(targetPath);
            }
        },
        goBack: () => {
            navigate(-1);
        },
        reset: (config: { index: number; routes: Array<{ name: string }> }) => {
            if (config.routes && config.routes.length > 0) {
                const targetRoute =
                    config.routes[config.index]?.name || config.routes[0].name;
                navigate(`/${targetRoute}`, { replace: true });
            }
        },
        exitApp: () => {
            window.location.href = '/'; 
        }
    };
};
