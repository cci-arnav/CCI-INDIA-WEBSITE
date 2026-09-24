import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import ScrollToTop from './components/layout/ScrollToTop'
import Home from './pages/Home'
import About from './pages/About'
import Services from './pages/Services'
import Councils from './pages/Councils'
import CouncilDetail from './pages/CouncilDetail'
import Membership from './pages/Membership'
import StatesInvestment from './pages/StatesInvestment'
import MarketEntry from './pages/MarketEntry'
import Careers from './pages/Careers'
import KnowledgePapers from './pages/KnowledgePapers'
import Events from './pages/Events'
import Gallery from './pages/Gallery'
import Contact from './pages/Contact'
import CouncilCategory from './pages/CouncilCategory'
import NewsDetail from './pages/NewsDetail'
import AdminGuard from './components/admin/AdminGuard'
import AdminLogin from './pages/admin/AdminLogin'
import AdminNews from './pages/admin/AdminNews'
import AdminNewsForm from './pages/admin/AdminNewsForm'

const BharatInvestmentGrid = lazy(() => import('./pages/BharatInvestmentGrid'))
const BIGStateDetail = lazy(() => import('./pages/BIGStateDetail'))
const BIGOpportunityDetail = lazy(() => import('./pages/BIGOpportunityDetail'))
const bigRouteFallback = <div className="container-main section-padding" role="status">Loading Bharat Investment Grid…</div>

const App = () => {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/councils" element={<Councils />} />
          <Route path="/councils/parliamentarian" element={<CouncilCategory type="parliamentarian" />} />
          <Route path="/councils/international" element={<CouncilCategory type="international" />} />
          <Route path="/councils/:slug" element={<CouncilDetail />} />
          <Route path="/membership" element={<Membership />} />
          <Route path="/states-investment" element={<StatesInvestment />} />
          <Route path="/bharat-investment-grid" element={<Suspense fallback={bigRouteFallback}><BharatInvestmentGrid /></Suspense>} />
          <Route path="/bharat-investment-grid/state/:stateSlug" element={<Suspense fallback={bigRouteFallback}><BIGStateDetail /></Suspense>} />
          <Route path="/bharat-investment-grid/opportunity/:opportunitySlug" element={<Suspense fallback={bigRouteFallback}><BIGOpportunityDetail /></Suspense>} />
          <Route path="/market-entry" element={<MarketEntry />} />
          <Route path="/careers" element={<Careers />} />
          <Route path="/knowledge-papers" element={<KnowledgePapers />} />
          <Route path="/events" element={<Events />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/news/:slug" element={<NewsDetail />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route element={<AdminGuard />}>
            <Route path="/admin/news" element={<AdminNews />} />
            <Route path="/admin/news/new" element={<AdminNewsForm />} />
            <Route path="/admin/news/:id/edit" element={<AdminNewsForm />} />
          </Route>
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}

export default App
