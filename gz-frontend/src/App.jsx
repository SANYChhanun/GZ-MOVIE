import { RouterProvider } from 'react-router-dom';
import { router } from './router';

function App() {
  // Don't auto-check auth on app start
  // User will be redirected to login if they try to access protected routes
  
  return <RouterProvider router={router} />;
}

export default App;
