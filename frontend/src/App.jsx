import { Route, Routes } from 'react-router-dom';
import { ToastProvider } from './components/ui/Toast';
import Layout from './components/layout/Layout';
import ErrorState from './components/ui/ErrorState';
import DashboardPage from './pages/DashboardPage';
import CreateTaskPage from './pages/CreateTaskPage';
import EditTaskPage from './pages/EditTaskPage';
import TaskDetailsPage from './pages/TaskDetailsPage';

// All pages live inside the Layout (top bar + icon rail).
export default function App() {
  return (
    <ToastProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/tasks/new" element={<CreateTaskPage />} />
          <Route path="/tasks/:id" element={<TaskDetailsPage />} />
          <Route path="/tasks/:id/edit" element={<EditTaskPage />} />
          <Route path="*" element={<ErrorState message="Page not found." />} />
        </Routes>
      </Layout>
    </ToastProvider>
  );
}
