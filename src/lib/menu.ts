import {
  LayoutDashboard,
  Users,
  Home,
  Settings,
  Megaphone,
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
        id: 'admins',
        labelKey: 'menu:admins',
        path: '/users',
      },
      {
        id: 'clients',
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
        id: 'all-properties',
        labelKey: 'menu:allProperties',
        path: '/real-estate/all',
      },
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
    ],
  },
  {
    id: 'content',
    labelKey: 'menu:content',
    icon: Megaphone,
    children: [
      {
        id: 'advertisements',
        labelKey: 'menu:advertisements',
        path: '/content/advertisements',
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
        children: [
          {
            id: 'governorates',
            labelKey: 'menu:governorates',
            path: '/settings/governorates',
          },
          {
            id: 'cities',
            labelKey: 'menu:cities',
            path: '/settings/cities',
          },
          {
            id: 'neighborhoods',
            labelKey: 'menu:neighborhoods',
            path: '/settings/neighborhoods',
          },
        ],
      },
      {
        id: 'real-estate-settings',
        labelKey: 'menu:realEstateSettings',
        children: [
          {
            id: 'property-features',
            labelKey: 'menu:propertyFeatures',
            path: '/settings/property-features',
          },
          {
            id: 'property-types',
            labelKey: 'menu:propertyTypes',
            path: '/settings/property-types',
          },
        ],
      },
      {
        id: 'app-settings',
        labelKey: 'menu:appSettings',
        children: [
          {
            id: 'general',
            labelKey: 'menu:adminSettings',
            path: '/settings/general',
          },
          {
            id: 'office-subscription-plans',
            labelKey: 'menu:officeSubscriptionPlans',
            path: '/settings/office-subscription-plans',
          },
        ],
      },
    ],
  },
]
