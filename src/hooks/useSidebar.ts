import { useSidebarStore } from '../store/sidebar.store'

export function useSidebar() {
  const store = useSidebarStore()
  return store
}
