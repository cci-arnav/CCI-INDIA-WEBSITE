import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Home from './pages/Home'
import About from './pages/About'
import Services from './pages/Services'
import Councils from './pages/Councils'
import CouncilDetail from './pages/CouncilDetail'
import Membership from './pages/Membership'
import StatesInvestment from './pages/StatesInvestment'
import MarketEntry from './pages/MarketEntry'
import Careers from './pages/Careers'
import Events from './pages/Events'
import Gallery from './pages/Gallery'
import Contact from './pages/Contact'

const App = () => {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/councils" element={<Councils />} />
          <Route path="/councils/:slug" element={<CouncilDetail />} />
          <Route path="/membership" element={<Membership />} />
          <Route path="/states-investment" element={<StatesInvestment />} />
          <Route path="/market-entry" element={<MarketEntry />} />
          <Route path="/careers" element={<Careers />} />
          <Route path="/events" element={<Events />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}

export default App
