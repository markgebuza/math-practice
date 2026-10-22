import { useNavigate } from 'react-router';
import { ErrorMessage } from '../components/common/ErrorMessage';

// The router's errorElement. Navigating clears the route error, so Return Home shows Home again.
export function ErrorPage() {
  const navigate = useNavigate();
  return <ErrorMessage onReturnHome={() => navigate('/')} />;
}
