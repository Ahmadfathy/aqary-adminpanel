import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const routes = [
  { path: 'dashboard', title: 'Dashboard' },
  { path: 'analytics/overview', title: 'Overview' },
  { path: 'analytics/reports/sales', title: 'Sales Report' },
  { path: 'analytics/reports/traffic', title: 'Traffic Report' },
  { path: 'analytics/reports/behavior', title: 'User Behavior' },
  { path: 'analytics/real-time', title: 'Real-Time' },
  { path: 'users', title: 'All Users' },
  { path: 'users/roles', title: 'Roles' },
  { path: 'users/permissions', title: 'Permissions' },
  { path: 'users/access-logs', title: 'Access Logs' },
  { path: 'users/invitations', title: 'Invitations' },
  { path: 'shop/products', title: 'All Products' },
  { path: 'shop/categories', title: 'Categories' },
  { path: 'shop/inventory', title: 'Inventory' },
  { path: 'shop/orders', title: 'Orders' },
  { path: 'shop/customers', title: 'Customers' },
  { path: 'content/pages', title: 'Pages' },
  { path: 'content/blog/posts', title: 'Posts' },
  { path: 'content/blog/comments', title: 'Comments' },
  { path: 'content/blog/tags', title: 'Tags' },
  { path: 'content/media', title: 'Media Library' },
  { path: 'settings/general', title: 'General' },
  { path: 'settings/security', title: 'Security' },
  { path: 'settings/integrations', title: 'Integrations' },
]

const pagesDir = path.join(__dirname, 'src', 'pages')

function toComponentName(str) {
  return str
    .split(/[-/]/)
    .filter(Boolean)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join('') + 'Page'
}

let routerImports = `import { createBrowserRouter } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
`

let routerRoutes = `
export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
`

routes.forEach((route) => {
  const compName = toComponentName(route.path)
  
  // ensure dir
  const fullPath = path.join(pagesDir, route.path)
  fs.mkdirSync(fullPath, { recursive: true })
  
  const compContent = `import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'

export function ${compName}() {
  const { t } = useTranslation('menu')
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">{t('${route.path.split('/').pop()}')}</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline">Export</Button>
          <Button>Create New</Button>
        </div>
      </div>
      
      {/* Placeholder content */}
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
            <div className="flex flex-col gap-2">
              <div className="h-4 w-24 rounded bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
              <div className="h-8 w-16 rounded bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
      <div className="min-h-[400px] rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
        <div className="flex h-full items-center justify-center text-sm text-zinc-500">
          Main content area for ${route.title}
        </div>
      </div>
    </div>
  )
}
`
  
  fs.writeFileSync(path.join(fullPath, 'index.tsx'), compContent)
  
  routerImports += `import { ${compName} } from './pages/${route.path}'\n`
  routerRoutes += `      {
        path: '${route.path}',
        element: <${compName} />,
      },\n`
})

routerRoutes += `    ],
  },
])
`

fs.writeFileSync(path.join(__dirname, 'src', 'router.tsx'), routerImports + routerRoutes)
