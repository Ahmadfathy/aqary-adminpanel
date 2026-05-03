import {
  LayoutDashboard,
  BarChart,
  Users,
  ShoppingCart,
  FileText,
  Settings,
  type LucideIcon
} from 'lucide-react'

export type MenuItem = {
  id: string
  labelKey: string
  icon?: LucideIcon
  path?: string
  children?: MenuItem[]
}

export const menu: MenuItem[] = [
  {
    id: 'dashboard',
    labelKey: 'menu:dashboard',
    icon: LayoutDashboard,
    path: '/dashboard',
  },
  {
    id: 'analytics',
    labelKey: 'menu:analytics',
    icon: BarChart,
    children: [
      {
        id: 'overview',
        labelKey: 'menu:overview',
        path: '/analytics/overview',
      },
      {
        id: 'reports',
        labelKey: 'menu:reports',
        children: [
          {
            id: 'sales',
            labelKey: 'menu:salesReport',
            path: '/analytics/reports/sales',
          },
          {
            id: 'traffic',
            labelKey: 'menu:trafficReport',
            path: '/analytics/reports/traffic',
          },
          {
            id: 'behavior',
            labelKey: 'menu:userBehavior',
            path: '/analytics/reports/behavior',
          },
        ],
      },
      {
        id: 'real-time',
        labelKey: 'menu:realTime',
        path: '/analytics/real-time',
      },
    ],
  },
  {
    id: 'users',
    labelKey: 'menu:userManagement',
    icon: Users,
    children: [
      {
        id: 'all-users',
        labelKey: 'menu:allUsers',
        path: '/users',
      },
      {
        id: 'roles-permissions',
        labelKey: 'menu:rolesPermissions',
        children: [
          {
            id: 'roles',
            labelKey: 'menu:roles',
            path: '/users/roles',
          },
          {
            id: 'permissions',
            labelKey: 'menu:permissions',
            path: '/users/permissions',
          },
          {
            id: 'access-logs',
            labelKey: 'menu:accessLogs',
            path: '/users/access-logs',
          },
        ],
      },
      {
        id: 'invitations',
        labelKey: 'menu:invitations',
        path: '/users/invitations',
      },
    ],
  },
  {
    id: 'ecommerce',
    labelKey: 'menu:ecommerce',
    icon: ShoppingCart,
    children: [
      {
        id: 'products',
        labelKey: 'menu:products',
        children: [
          {
            id: 'all-products',
            labelKey: 'menu:allProducts',
            path: '/shop/products',
          },
          {
            id: 'categories',
            labelKey: 'menu:categories',
            path: '/shop/categories',
          },
          {
            id: 'inventory',
            labelKey: 'menu:inventory',
            path: '/shop/inventory',
          },
        ],
      },
      {
        id: 'orders',
        labelKey: 'menu:orders',
        path: '/shop/orders',
      },
      {
        id: 'customers',
        labelKey: 'menu:customers',
        path: '/shop/customers',
      },
    ],
  },
  {
    id: 'content',
    labelKey: 'menu:content',
    icon: FileText,
    children: [
      {
        id: 'pages',
        labelKey: 'menu:pages',
        path: '/content/pages',
      },
      {
        id: 'blog',
        labelKey: 'menu:blog',
        children: [
          {
            id: 'posts',
            labelKey: 'menu:posts',
            path: '/content/blog/posts',
          },
          {
            id: 'comments',
            labelKey: 'menu:comments',
            path: '/content/blog/comments',
          },
          {
            id: 'tags',
            labelKey: 'menu:tags',
            path: '/content/blog/tags',
          },
        ],
      },
      {
        id: 'media',
        labelKey: 'menu:mediaLibrary',
        path: '/content/media',
      },
    ],
  },
  {
    id: 'settings',
    labelKey: 'menu:settings',
    icon: Settings,
    children: [
      {
        id: 'general',
        labelKey: 'menu:general',
        path: '/settings/general',
      },
      {
        id: 'security',
        labelKey: 'menu:security',
        path: '/settings/security',
      },
      {
        id: 'integrations',
        labelKey: 'menu:integrations',
        path: '/settings/integrations',
      },
    ],
  },
]
