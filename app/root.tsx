import { Links, Meta, Outlet, Scripts, ScrollRestoration } from 'react-router'
import Navbar from './components/navbar'
import Footer from './components/footer'
import './style/layout.css'

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        <script src="https://accounts.google.com/gsi/client" async defer></script>
      </head>
      <body>
        <div className="layout">
          <Navbar />
          <main className="layout-content">
            <div className="container">
              {children}
            </div>
          </main>
          <Footer />
        </div>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

export default function Root() {
  return <Outlet />
}
