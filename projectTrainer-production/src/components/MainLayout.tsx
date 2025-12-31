import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export function MainLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <Header />
      <main className="lg:ml-64 pt-16 min-h-screen">
        <div className="px-4 py-8 lg:px-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
