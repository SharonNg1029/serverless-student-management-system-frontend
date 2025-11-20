import { Link, useLocation } from 'react-router'
import '../style/navbar.css'

export default function Navbar() {
  const location = useLocation()

  // Don't show navbar on login page
  if (location.pathname === '/login') {
    return null
  }

  const navItems = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Students', href: '/students' },
    { label: 'Courses', href: '/courses' },
  ]

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/dashboard" className="navbar-logo">
          LMS
        </Link>
        <div className="navbar-menu">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={`navbar-item ${location.pathname === item.href ? 'active' : ''}`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}
