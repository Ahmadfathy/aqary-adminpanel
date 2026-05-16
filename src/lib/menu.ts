import {
  LayoutDashboard,
  Users,
  Home,
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
        id: 'customers',
        labelKey: 'menu:customers',
        path: '/shop/customers',
      },
      {
        id: 'real-estate-offices',
        labelKey: 'menu:realEstateOffices',
        path: '/offices',
      },
    ],
  },
  {
    id: 'real-estate',
    labelKey: 'menu:realEstate',
    icon: Home,
    children: [
      {
        id: 'sale',
        labelKey: 'menu:sale',
        path: '/real-estate/sale',
      },
      {
        id: 'rent',
        labelKey: 'menu:rent',
        path: '/real-estate/rent',
      },
      {
        id: 'buy',
        labelKey: 'menu:buy',
        path: '/real-estate/buy',
      },
    ],
  },
  {
    id: 'settings',
    labelKey: 'menu:settings',
    icon: Settings,
    children: [
      {
        id: 'general-settings',
        labelKey: 'menu:generalSettings',
        path: '/settings/general',
      },
      {
        id: 'countries',
        labelKey: 'menu:countries',
        path: '/settings/countries',
      },
      {
        id: 'cities',
        labelKey: 'menu:cities',
        path: '/settings/cities',
      },
      {
        id: 'regions',
        labelKey: 'menu:regions',
        path: '/settings/regions',
      },
    ],
  },
]
