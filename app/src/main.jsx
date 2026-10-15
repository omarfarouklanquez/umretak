import { StrictMode, useEffect, useSyncExternalStore } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import './index.css'
import { db } from './lib/db'
import { ensureSeed } from './lib/logic'
import { UIProvider } from './ui'
import Layout from './Layout'
import Home from './pages/Home'
import { HajjPage, PackageDetail, PackagesPage, ComparePage } from './pages/Packages'
import { HotelDetail, HotelsPage } from './pages/Hotels'
import FlightsPage from './pages/Flights'
import { ToursPage, TrainPage, TransportPage, VisaPage } from './pages/Services'
import StorePage from './pages/Store'
import Checkout from './pages/Checkout'
import { TripDetail, TripsPage } from './pages/Trips'
import { AccountPage, SavedPage, SpinPage } from './pages/Account'
import { AboutPage, BlogPage, CareersPage, FaqPage, PolicyPage, PostPage, ReviewsPage, SearchPage, SupportPage } from './pages/Content'
import Builder from './pages/Builder'

ensureSeed()

function ScrollTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

function App() {
  // Any storage write re-renders the tree — simple, consistent state for a prototype.
  useSyncExternalStore(db.subscribe, db.version)
  return (
    <UIProvider>
      <HashRouter>
        <ScrollTop />
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="umrah" element={<PackagesPage />} />
            <Route path="umrah/:id" element={<PackageDetail />} />
            <Route path="compare" element={<ComparePage />} />
            <Route path="hajj" element={<HajjPage />} />
            <Route path="hotels" element={<HotelsPage />} />
            <Route path="hotels/:id" element={<HotelDetail />} />
            <Route path="flights" element={<FlightsPage />} />
            <Route path="visa" element={<VisaPage />} />
            <Route path="transport" element={<TransportPage />} />
            <Route path="train" element={<TrainPage />} />
            <Route path="tours" element={<ToursPage />} />
            <Route path="store" element={<StorePage />} />
            <Route path="builder" element={<Builder />} />
            <Route path="checkout" element={<Checkout />} />
            <Route path="trips" element={<TripsPage />} />
            <Route path="trips/:id" element={<TripDetail />} />
            <Route path="account" element={<AccountPage />} />
            <Route path="saved" element={<SavedPage />} />
            <Route path="spin" element={<SpinPage />} />
            <Route path="support" element={<SupportPage />} />
            <Route path="blog" element={<BlogPage />} />
            <Route path="blog/:id" element={<PostPage />} />
            <Route path="faq" element={<FaqPage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="careers" element={<CareersPage />} />
            <Route path="reviews" element={<ReviewsPage />} />
            <Route path="policies/:kind" element={<PolicyPage />} />
            <Route path="search" element={<SearchPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </HashRouter>
    </UIProvider>
  )
}

createRoot(document.getElementById('root')).render(<StrictMode><App /></StrictMode>)
