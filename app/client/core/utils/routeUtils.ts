import type { RouteNode, RouteNodePath } from '../types/types';

export function generateMobileName(
    node: RouteNode,
    parentPath: string = '',
    index: number = 0,
): string {
    // If explicitly set, use it
    if (node.name) {
        return node.name;
    }

    // If path is empty, generate a unique name
    if (node.path === '') {
        // Root level
        if (parentPath === '') {
            return '_root';
        }

        // Nested empty path - use parent path + index
        const cleanParentPath = parentPath
            .replace(/\//g, '_')
            .replace(/^_/, '');
        return `_${cleanParentPath}_index${index > 0 ? index : ''}`;
    }

    // Normal path - use as-is (removing leading slash if present)
    return node.path.replace(/^\//, '');
}

export function normalizeMobileRoutes(
    node: RouteNode,
    parentPath: string = '',
): RouteNode {
    const name = generateMobileName(node, parentPath, 0);

    // Build the current full path for children
    const currentPath = parentPath
        ? `${parentPath}/${node.path}`.replace(/\/+/g, '/')
        : node.path;

    // Process children if they exist
    const children = node.children?.map((child) =>
        normalizeMobileRoutes(
            child,
            currentPath || '_', // If current path is empty, use '_' as parent identifier
        ),
    );

    return {
        ...node,
        name,
        children,
    };
}

export function getMobileScreenName(node: RouteNode): string {
    return node.name || node.path || '_unnamed';
}


export function createRouteMap(
    node: RouteNode,
    parentPath = ""
): RouteNodePath {
    const fullPath = joinPaths(parentPath, node.path);

    return {
        path: fullPath,
        name: node.name,
        options: node.options ?? null,
        ...(node.children?.length
            ? {
                children: node.children.map((child) =>
                    createRouteMap(child, fullPath)
                ),
            }
            : {}
        ),
    };
}

function joinPaths(parent: string, child: string): string {
    return `${parent}/${child}`
        .replace(/\/+/g, "/")      // убираем двойные /
        .replace(/\/$/, "") || "/"; // корень остается "/"
}
