import { BrowserRouter, Route, Routes } from 'react-router-dom'
import About from './components/about.jsx'
import Home from './components/home.jsx'
import Layout from './components/Layout.jsx'
import Login from './components/login.jsx'
import AddMedia from './components/addMedia.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/new" element={<AddMedia />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}