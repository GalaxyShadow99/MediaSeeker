import { Container } from 'react-bootstrap'
import { Link } from 'react-router-dom'

export default function MyFooter() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-white text-center text-muted mt-auto border-top py-3">
      <Container className="small">
        <span>© {currentYear} </span>
        <a
          href="https://github.com/GalaxyShadow99/MediaSeeker"
          target="_blank"
          rel="noopener noreferrer"
          className="text-decoration-none fw-semibold text-dark"
        >
          MediaSeeker
        </a>
        <span> — Développé par Thomas C.</span>
        <span className="mx-2">-</span>
        <Link to="/about" className="text-decoration-none">
          À propos du projet
        </Link>
      </Container>
    </footer>
  )
}