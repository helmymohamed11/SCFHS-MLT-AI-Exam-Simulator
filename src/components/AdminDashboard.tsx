import React from 'react';
import { User } from '../types';
import { Users, Database, Settings, LogOut } from 'lucide-react';

interface AdminDashboardProps {
  user: User;
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, onLogout }) => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <header className="bg-white dark:bg-slate-800 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center">
              <span role="img" aria-label="admin" className="mr-3 text-2xl">👨‍💼</span>
              Admin Dashboard
            </h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Welcome, {user.name}
              </span>
              <button 
                onClick={onLogout} 
                className="flex items-center px-3 py-1.5 border border-slate-300 dark:border-slate-600 rounded-md text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-colors"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* User Management */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6">
            <div className="flex items-center mb-4">
              <Users className="h-8 w-8 text-sky-600 mr-3" />
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                User Management
              </h2>
            </div>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Manage user accounts, permissions, and access levels.
            </p>
            <button className="w-full px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-md transition-colors">
              Manage Users
            </button>
          </div>

          {/* Question Bank */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6">
            <div className="flex items-center mb-4">
              <Database className="h-8 w-8 text-green-600 mr-3" />
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Question Bank
              </h2>
            </div>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Add, edit, and manage questions in the shared database.
            </p>
            <button className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-md transition-colors">
              Manage Questions
            </button>
          </div>

          {/* System Settings */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6">
            <div className="flex items-center mb-4">
              <Settings className="h-8 w-8 text-purple-600 mr-3" />
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                System Settings
              </h2>
            </div>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Configure system settings, exam parameters, and more.
            </p>
            <button className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-md transition-colors">
              System Settings
            </button>
          </div>
        </div>

        {/* Statistics */}
        <div className="mt-8 bg-white dark:bg-slate-800 rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
            System Statistics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-sky-600">0</div>
              <div className="text-sm text-slate-500">Total Users</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">150</div>
              <div className="text-sm text-slate-500">Questions</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">0</div>
              <div className="text-sm text-slate-500">Exams Taken</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-amber-600">0%</div>
              <div className="text-sm text-slate-500">Avg Pass Rate</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;