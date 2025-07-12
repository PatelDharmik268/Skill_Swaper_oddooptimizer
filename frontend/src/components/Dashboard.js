import React, { useState } from 'react';
import { 
  User, 
  Search, 
  Bell, 
  Settings, 
  Home, 
  Users, 
  Calendar, 
  FileText, 
  BarChart3,
  Plus,
  Filter,
  MoreHorizontal
} from 'lucide-react';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');

  // Sample data for demonstration
  const soapRequests = [
    { id: 1, name: 'Lavender Mint', status: 'Pending', date: '2024-01-15', client: 'John Doe' },
    { id: 2, name: 'Vanilla Rose', status: 'Accepted', date: '2024-01-14', client: 'Jane Smith' },
    { id: 3, name: 'Coconut Lime', status: 'Rejected', date: '2024-01-13', client: 'Mike Johnson' },
    { id: 4, name: 'Honey Oat', status: 'Pending', date: '2024-01-12', client: 'Sarah Wilson' },
  ];

  const stats = [
    { label: 'Total Requests', value: '24', change: '+12%' },
    { label: 'Pending', value: '8', change: '+5%' },
    { label: 'Accepted', value: '12', change: '+8%' },
    { label: 'Rejected', value: '4', change: '-2%' },
  ];

  const sidebarItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'requests', label: 'Soap Requests', icon: FileText },
    { id: 'clients', label: 'Clients', icon: Users },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Accepted': return 'bg-green-100 text-green-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-200 rounded-lg flex items-center justify-center">
                <span className="text-purple-600 font-bold text-lg">SP</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Soap Platform</h1>
                <p className="text-sm text-gray-500">Dashboard</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 w-64 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              
              {/* Notifications */}
              <button className="p-2 text-gray-400 hover:text-purple-600 transition-colors">
                <Bell size={20} />
              </button>
              
              {/* Profile */}
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-200 rounded-full flex items-center justify-center">
                  <User size={16} className="text-purple-600" />
                </div>
                <span className="text-gray-700 font-medium">Admin</span>
                <button 
                  onClick={onLogout}
                  className="text-sm text-gray-500 hover:text-purple-600 transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Navigation Menu */}
        <nav className="bg-white border-t border-gray-200">
          <div className="px-8">
            <div className="flex space-x-8">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center space-x-2 px-4 py-4 text-sm font-medium transition-colors border-b-2 ${
                      activeTab === item.id
                        ? 'text-purple-600 border-purple-500'
                        : 'text-gray-600 border-transparent hover:text-purple-600 hover:border-purple-300'
                    }`}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <div className="overflow-hidden">

        {/* Dashboard Content */}
        <main className="p-8 overflow-y-auto">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-800 mt-1">{stat.value}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-sm font-medium ${
                      stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.change}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-4 mb-6">
            <button className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center space-x-2">
              <Plus size={20} />
              <span>New Request</span>
            </button>
            <button className="bg-white text-purple-600 px-6 py-3 rounded-lg font-medium border border-purple-200 hover:bg-purple-50 transition-colors flex items-center space-x-2">
              <Filter size={20} />
              <span>Filter</span>
            </button>
          </div>

          {/* Soap Requests Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">Recent Soap Requests</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Request
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {soapRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                            <span className="text-purple-600 font-medium text-sm">
                              {request.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{request.name}</div>
                            <div className="text-sm text-gray-500">ID: {request.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{request.client}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(request.status)}`}>
                          {request.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {request.date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button className="text-purple-600 hover:text-purple-900 transition-colors">
                          <MoreHorizontal size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;