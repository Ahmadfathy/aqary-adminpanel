import { createBrowserRouter } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { DashboardPage } from './pages/dashboard'
import { AnalyticsOverviewPage } from './pages/analytics/overview'
import { AnalyticsReportsSalesPage } from './pages/analytics/reports/sales'
import { AnalyticsReportsTrafficPage } from './pages/analytics/reports/traffic'
import { AnalyticsReportsBehaviorPage } from './pages/analytics/reports/behavior'
import { AnalyticsRealTimePage } from './pages/analytics/real-time'
import { UsersPage } from './pages/users'
import { CreateUserPage } from './pages/users/create'
import { EditUserPage } from './pages/users/edit'
import { UsersRolesPage } from './pages/users/roles'
import { UsersPermissionsPage } from './pages/users/permissions'
import { UsersAccessLogsPage } from './pages/users/access-logs'
import { UsersInvitationsPage } from './pages/users/invitations'
import { ShopProductsPage } from './pages/shop/products'
import { ShopCategoriesPage } from './pages/shop/categories'
import { ShopInventoryPage } from './pages/shop/inventory'
import { ShopOrdersPage } from './pages/shop/orders'
import { ShopCustomersPage } from './pages/shop/customers'
import { ContentPagesPage } from './pages/content/pages'
import { ContentBlogPostsPage } from './pages/content/blog/posts'
import { ContentBlogCommentsPage } from './pages/content/blog/comments'
import { ContentBlogTagsPage } from './pages/content/blog/tags'
import { ContentMediaPage } from './pages/content/media'
import { SettingsGeneralPage } from './pages/settings/general'
import { SettingsSecurityPage } from './pages/settings/security'
import { SettingsIntegrationsPage } from './pages/settings/integrations'
import { LoginPage } from './pages/auth/login'

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: <AppShell />,
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: 'dashboard',
        element: <DashboardPage />,
      },
      {
        path: 'analytics/overview',
        element: <AnalyticsOverviewPage />,
      },
      {
        path: 'analytics/reports/sales',
        element: <AnalyticsReportsSalesPage />,
      },
      {
        path: 'analytics/reports/traffic',
        element: <AnalyticsReportsTrafficPage />,
      },
      {
        path: 'analytics/reports/behavior',
        element: <AnalyticsReportsBehaviorPage />,
      },
      {
        path: 'analytics/real-time',
        element: <AnalyticsRealTimePage />,
      },
      {
        path: 'users',
        element: <UsersPage />,
      },
      {
        path: 'users/create',
        element: <CreateUserPage />,
      },
      {
        path: 'users/:id/edit',
        element: <EditUserPage />,
      },
      {
        path: 'users/roles',
        element: <UsersRolesPage />,
      },
      {
        path: 'users/permissions',
        element: <UsersPermissionsPage />,
      },
      {
        path: 'users/access-logs',
        element: <UsersAccessLogsPage />,
      },
      {
        path: 'users/invitations',
        element: <UsersInvitationsPage />,
      },
      {
        path: 'shop/products',
        element: <ShopProductsPage />,
      },
      {
        path: 'shop/categories',
        element: <ShopCategoriesPage />,
      },
      {
        path: 'shop/inventory',
        element: <ShopInventoryPage />,
      },
      {
        path: 'shop/orders',
        element: <ShopOrdersPage />,
      },
      {
        path: 'shop/customers',
        element: <ShopCustomersPage />,
      },
      {
        path: 'content/pages',
        element: <ContentPagesPage />,
      },
      {
        path: 'content/blog/posts',
        element: <ContentBlogPostsPage />,
      },
      {
        path: 'content/blog/comments',
        element: <ContentBlogCommentsPage />,
      },
      {
        path: 'content/blog/tags',
        element: <ContentBlogTagsPage />,
      },
      {
        path: 'content/media',
        element: <ContentMediaPage />,
      },
      {
        path: 'settings/general',
        element: <SettingsGeneralPage />,
      },
      {
        path: 'settings/security',
        element: <SettingsSecurityPage />,
      },
      {
        path: 'settings/integrations',
        element: <SettingsIntegrationsPage />,
      },
    ],
  },
])
