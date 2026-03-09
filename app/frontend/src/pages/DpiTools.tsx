import { Navigate } from 'react-router-dom';

// Removed legacy feature. Redirect to the problems library.
export default function DpiTools() {
  return <Navigate to="/problems" replace />;
}
