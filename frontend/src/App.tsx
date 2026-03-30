import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Suspense, lazy } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ToastProvider } from './components/ui/Toast'
import { ErrorBoundary } from './components/ui/ErrorBoundary'
import Layout from './components/Layout'
import './index.css'

// Lazy load pages for code splitting
const Home = lazy(() => import('./pages/Home'))
const Companies = lazy(() => import('./pages/Companies'))
const CompanyDetail = lazy(() => import('./pages/CompanyDetail'))
const CompareCompanies = lazy(() => import('./pages/CompareCompanies'))
const Jobs = lazy(() => import('./pages/Jobs'))
const Offers = lazy(() => import('./pages/Offers'))
const Predictions = lazy(() => import('./pages/Predictions'))
const LotteryCalculator = lazy(() => import('./pages/LotteryCalculator'))
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

// Page transition wrapper
function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  )
}

// Loading fallback component
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 border-2 border-bg-tertiary rounded-full" />
          <div className="absolute inset-0 border-2 border-t-accent border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" />
        </div>
        <span className="text-sm text-text-muted">Loading...</span>
      </div>
    </div>
  )
}

function AnimatedRoutes() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <Layout>
              <Suspense fallback={<PageLoader />}>
                <PageTransition>
                  <Home />
                </PageTransition>
              </Suspense>
            </Layout>
          }
        />
        <Route
          path="/companies"
          element={
            <Layout>
              <Suspense fallback={<PageLoader />}>
                <PageTransition>
                  <Companies />
                </PageTransition>
              </Suspense>
            </Layout>
          }
        />
        <Route
          path="/companies/:slug"
          element={
            <Layout>
              <Suspense fallback={<PageLoader />}>
                <PageTransition>
                  <CompanyDetail />
                </PageTransition>
              </Suspense>
            </Layout>
          }
        />
        <Route
          path="/jobs"
          element={
            <Layout>
              <Suspense fallback={<PageLoader />}>
                <PageTransition>
                  <Jobs />
                </PageTransition>
              </Suspense>
            </Layout>
          }
        />
        <Route
          path="/compare"
          element={
            <Layout>
              <Suspense fallback={<PageLoader />}>
                <PageTransition>
                  <CompareCompanies />
                </PageTransition>
              </Suspense>
            </Layout>
          }
        />
        <Route
          path="/offers"
          element={
            <Layout>
              <Suspense fallback={<PageLoader />}>
                <PageTransition>
                  <Offers />
                </PageTransition>
              </Suspense>
            </Layout>
          }
        />
        <Route
          path="/predictions"
          element={
            <Layout>
              <Suspense fallback={<PageLoader />}>
                <PageTransition>
                  <Predictions />
                </PageTransition>
              </Suspense>
            </Layout>
          }
        />
        <Route
          path="/lottery-calculator"
          element={
            <Layout>
              <Suspense fallback={<PageLoader />}>
                <PageTransition>
                  <LotteryCalculator />
                </PageTransition>
              </Suspense>
            </Layout>
          }
        />
        <Route
          path="/privacy"
          element={
            <Layout>
              <Suspense fallback={<PageLoader />}>
                <PageTransition>
                  <Privacy />
                </PageTransition>
              </Suspense>
            </Layout>
          }
        />
        <Route
          path="/terms"
          element={
            <Layout>
              <Suspense fallback={<PageLoader />}>
                <PageTransition>
                  <Terms />
                </PageTransition>
              </Suspense>
            </Layout>
          }
        />
        <Route
          path="*"
          element={
            <Layout>
              <Suspense fallback={<PageLoader />}>
                <PageTransition>
                  <NotFound />
                </PageTransition>
              </Suspense>
            </Layout>
          }
        />
      </Routes>
    </AnimatePresence>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <ToastProvider>
          <Router>
            <AnimatedRoutes />
          </Router>
        </ToastProvider>
      </ErrorBoundary>
    </QueryClientProvider>
  )
}

export default App
