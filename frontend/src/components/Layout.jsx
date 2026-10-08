import { Navigate, Outlet } from 'react-router-dom'
import MyNavbar from './navbar.jsx'
import MyFooter from './footer.jsx'

export default function Layout() {
  const isAuthenticated = Boolean(sessionStorage.getItem('access_token'))

  if (!isAuthenticated && window.location.pathname !== '/login') {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      {/* Top navigation bar */}
      <MyNavbar />

      {/* Dynamic page outlet */}
      <main className="flex-grow-1 container py-4">
        <Outlet />
      </main>

      {/* Global footer */}
      <MyFooter />
    </div>
  )
}
