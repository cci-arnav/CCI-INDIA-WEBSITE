import TopUtilityBar from './TopUtilityBar'
import Navbar from './Navbar'
import Footer from './Footer'
import BIGFloatingTab from '../big/BIGFloatingTab'

export default function Layout({ children }) {
  return (
    <div className="flex min-h-screen flex-col">
      <TopUtilityBar />
      <Navbar />
      <main className="flex-1">{children}</main>
      <BIGFloatingTab />
      <Footer />
    </div>
  )
}
