import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import { useDirection } from './hooks/useDirection'
import { useTheme } from './hooks/useTheme'

function App() {
  // Initialize hooks that need to run at root
  useDirection()
  useTheme()

  return <RouterProvider router={router} />
}

export default App
