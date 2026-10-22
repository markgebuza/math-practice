import { Outlet } from 'react-router';
import { StorageWarning } from '../common/StorageWarning';
import { Header } from './Header';

export function AppLayout() {
  return (
    <>
      <Header />
      <StorageWarning />
      <Outlet />
    </>
  );
}
