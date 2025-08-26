import React, { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { 
  Activity, Users, DollarSign, Server, 
  Zap, Shield, BarChart3, Globe 
} from 'lucide-react'

export default function Dashboard() {
  const [realTimeMetrics, setRealTimeMetrics] = useState({
    requests: 0,
    users: 0,
    revenue: 0
  })
  
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['metrics'],
    queryFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/metrics`)
      return res.json()
    },
    refetchInterval: 5000
  })
  
  useEffect(() => {
    if (metrics) {
      setRealTimeMetrics({
        requests: metrics.requestsPerSec,
        users: metrics.activeUsers,
        revenue: metrics.revenue
      })
    }
  }, [metrics])
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Zap className="w-8 h-8 text-indigo-600 mr-3" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">TechyPark Engine</h1>
                <p className="text-xs text-gray-500">AI-Powered Infrastructure</p>
              </div>
            </div>
            
            <nav className="flex space-x-8">
              {['Dashboard', 'Sites', 'AI Tools', 'Analytics'].map(item => (
                <a
                  key={item}
                  href="#"
                  className="text-gray-700 hover:text-indigo-600 px-3 py-2 text-sm font-medium"
                >
                  {item}
                </a>
              ))}
            </nav>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total Sites"
            value={metrics?.totalSites || 0}
            icon={Globe}
            color="blue"
            change="+12%"
          />
          <MetricCard
            title="Active Users"
            value={metrics?.activeUsers || 0}
            icon={Users}
            color="green"
            change="+5%"
          />
          <MetricCard
            title="Requests/sec"
            value={realTimeMetrics.requests}
            icon={Activity}
            color="purple"
            change="+23%"
          />
          <MetricCard
            title="Revenue"
            value={`$${(metrics?.revenue || 0).toLocaleString()}`}
            icon={DollarSign}
            color="yellow"
            change="+18%"
          />
        </div>
        
        {/* AI Features */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">AI-Powered Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <AIFeatureCard
              title="Code Assistant"
              description="GPT-4 powered code suggestions and reviews"
              icon="🤖"
              status="active"
            />
            <AIFeatureCard
              title="Visual Builder"
              description="Drag-and-drop with AI design assistance"
              icon="🎨"
              status="active"
            />
            <AIFeatureCard
              title="Predictive Scaling"
              description="AI-driven resource optimization"
              icon="📊"
              status="beta"
            />
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="p-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
              Deploy New Site
            </button>
            <button className="p-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
              Launch AI Assistant
            </button>
            <button className="p-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition">
              Open Builder
            </button>
            <button className="p-4 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition">
              View Analytics
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

function MetricCard({ title, value, icon: Icon, color, change }) {
  const colors = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    yellow: 'bg-yellow-500'
  }
  
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          <p className="text-xs text-green-600 mt-2">{change}</p>
        </div>
        <div className={`${colors[color]} p-3 rounded-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  )
}

function AIFeatureCard({ title, description, icon, status }) {
  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-start justify-between mb-2">
        <span className="text-2xl">{icon}</span>
        <span className={`text-xs px-2 py-1 rounded-full ${
          status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
        }`}>
          {status}
        </span>
      </div>
      <h3 className="font-semibold mb-1">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  )
}
