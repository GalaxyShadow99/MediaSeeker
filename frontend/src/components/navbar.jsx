import { useEffect, useState } from 'react'
import { Button, Container, Modal, Nav, Navbar } from 'react-bootstrap'
import { Link, useNavigate } from 'react-router-dom'
import { checkToken } from '../utils.tsx'

function MyNavbar() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    Boolean(sessionStorage.getItem('access_token')),
  )
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const validateToken = async () => {
      const isValid = await checkToken()
      setIsAuthenticated(isValid)
    }

    validateToken()
  }, [])

  const handleLogout = () => {
    sessionStorage.removeItem('access_token')
    setShowLogoutModal(false)
    setIsAuthenticated(false)
    navigate('/login')
  }

  return (
    <>
      <Navbar bg="dark" variant="dark" expand="lg" className="shadow-sm">
        <Container>
          <Navbar.Brand as={Link} to="/" className="fw-semibold">
            MediaSeeker
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="main-navbar" />
          <Navbar.Collapse id="main-navbar">
            <Nav className="ms-auto align-items-lg-center">
              <Nav.Link as={Link} to="/">
                Accueil
              </Nav.Link>
              {isAuthenticated && (
                <Nav.Link as={Link} to="/new">
                  Ajouter
                </Nav.Link>
              )}
              <Nav.Link as={Link} to="/about">
                À propos
              </Nav.Link>
              {isAuthenticated ? (
                <Nav.Link
                  as="button"
                  type="button"
                  onClick={() => setShowLogoutModal(true)}
                  className="btn btn-outline-light ms-lg-3 px-3 py-1 text-white"
                >
                  Déconnexion
                </Nav.Link>
              ) : (
                <Nav.Link
                  as={Link}
                  to="/login"
                  className="btn btn-outline-light ms-lg-3 px-3 py-1 text-white"
                >
                  Connexion
                </Nav.Link>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Modal show={showLogoutModal} onHide={() => setShowLogoutModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirmer la déconnexion</Modal.Title>
        </Modal.Header>
        <Modal.Body>Voulez-vous vraiment vous déconnecter ?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowLogoutModal(false)}>
            Annuler
          </Button>
          <Button variant="danger" onClick={handleLogout}>
            Se déconnecter
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}

export default MyNavbar
