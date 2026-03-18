import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Suspense, lazy } from 'react'
import { ToastProvider } from './components/ui/Toast'
import { ErrorBoundary } from './components/ui/ErrorBoundary'
import { Spinner } from './components/ui/Spinner'
import Layout from './components/Layout'
import './index.css'

// Lazy load pages for code splitting
const Home = lazy(() => import('./pages/Home'))
const Companies = lazy(() => import('./pages/Companies'))
const CompanyDetail = lazy(() => import('./pages/CompanyDetail'))
const CompareCompanies = lazy(() => import('./pages/CompareCompanies'))
const Offers = lazy(() => import('./pages/Offers'))
const Predictions = lazy(() => import('./pages/Predictions'))
const LotteryCalculator = lazy(() => import('./pages/LotteryCalculator'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Privacy = lazy(() => import('./pages/Privacy'))
const Terms = lazy(() => import('./pages/Terms'))
const NotFound = lazy(() => import('./pages/NotFound'))

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 30,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
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
        <ToastProvider>
          <Router>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Layout><Home /></Layout>} />
                <Route path="/companies" element={<Layout><Companies /></Layout>} />
                <Route path="/companies/:slug" element={<Layout><CompanyDetail /></Layout>} />
                <Route path="/compare" element={<Layout><CompareCompanies /></Layout>} />
                <Route path="/offers" element={<Layout><Offers /></Layout>} />
                <Route path="/predictions" element={<Layout><Predictions /></Layout>} />
                <Route path="/lottery-calculator" element={<Layout><LotteryCalculator /></Layout>} />
                <Route path="/tracker" element={<Layout><Dashboard /></Layout>} />
                <Route path="/dashboard" element={<Navigate to="/tracker" replace />} />
                <Route path="/privacy" element={<Layout><Privacy /></Layout>} />
                <Route path="/terms" element={<Layout><Terms /></Layout>} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </Router>
        </ToastProvider>
      </ErrorBoundary>
    </QueryClientProvider>
  )
}

export default App
