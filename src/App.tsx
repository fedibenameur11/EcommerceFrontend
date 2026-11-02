import { RouterProvider } from 'react-router-dom';
import { router } from '@/routes/AppRoutes';

/**
 * Main App component with routing configuration
 */
function App() {
  return <RouterProvider router={router} />;
}

export default App;
