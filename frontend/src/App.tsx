import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Suspense, lazy } from 'react'
import { AuthProvider } from './contexts/AuthContext'
import { ToastProvider } from './components/ui/Toast'
import { ErrorBoundary } from './components/ui/ErrorBoundary'
import { Spinner } from './components/ui/Spinner'
import Layout from './components/Layout'
import { ProtectedRoute } from './components/ProtectedRoute'
import './index.css'

// Lazy load pages for code splitting
const Home = lazy(() => import('./pages/Home'))
const Companies = lazy(() => import('./pages/Companies'))
const CompanyDetail = lazy(() => import('./pages/CompanyDetail'))
const Offers = lazy(() => import('./pages/Offers'))
const Predictions = lazy(() => import('./pages/Predictions'))
const LotteryCalculator = lazy(() => import('./pages/LotteryCalculator'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'))
const ResetPassword = lazy(() => import('./pages/ResetPassword'))
const Profile = lazy(() => import('./pages/Profile'))
const Privacy = lazy(() => import('./pages/Privacy'))
const Terms = lazy(() => import('./pages/Terms'))
const NotFound = lazy(() => import('./pages/NotFound'))

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30, // 30 seconds - refresh data more frequently
      refetchOnWindowFocus: true,
      retry: 1,
    },
  },
})

// Loading fallback component
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary">
      <Spinner size="lg" />
    </div>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <AuthProvider>
          <ToastProvider>
            <Router>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  {/* Auth routes (no layout) */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />

                  {/* Public routes with layout */}
                  <Route path="/" element={<Layout><Home /></Layout>} />
                  <Route path="/companies" element={<Layout><Companies /></Layout>} />
                  <Route path="/companies/:slug" element={<Layout><CompanyDetail /></Layout>} />
                  <Route path="/offers" element={<Layout><Offers /></Layout>} />
                  <Route path="/predictions" element={<Layout><Predictions /></Layout>} />
                  <Route path="/lottery-calculator" element={<Layout><LotteryCalculator /></Layout>} />
                  <Route path="/privacy" element={<Layout><Privacy /></Layout>} />
                  <Route path="/terms" element={<Layout><Terms /></Layout>} />

                  {/* Protected routes with layout */}
                  <Route path="/dashboard" element={
                    <ProtectedRoute>
                      <Layout><Dashboard /></Layout>
                    </ProtectedRoute>
                  } />
                  <Route path="/profile" element={
                    <ProtectedRoute>
                      <Layout><Profile /></Layout>
                    </ProtectedRoute>
                  } />

                  {/* 404 catch-all */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </Router>
          </ToastProvider>
        </AuthProvider>
      </ErrorBoundary>
    </QueryClientProvider>
  )
}

export default App