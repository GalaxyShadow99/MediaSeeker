import { useState } from 'react'
import { Alert, Button, Card, Form } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { API_BASE_URL } from '../config.js'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')
  const [alertVariant, setAlertVariant] = useState('danger')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setAlertMessage('')
    setIsLoading(true)

    try {
      console.log(`Attempting to log in to ${API_BASE_URL}/login`)

      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email, password: password }),
      })

      const data = await response.json()

      if (response.ok && data.data?.access_token) {
        setAlertMessage('Connexion réussie !')
        setAlertVariant('success')
        sessionStorage.setItem('access_token', String(data.data.access_token))
        sessionStorage.setItem('user', JSON.stringify(data.data.user))
        localStorage.setItem('access_token', String(data.data.access_token))
        await new Promise((r) => setTimeout(r, 1000))
        navigate('/')
      } else {
        sessionStorage.removeItem('access_token')
        localStorage.removeItem('access_token')
        setAlertMessage(data.detail || data.message || 'Erreur lors de la connexion.')
        setAlertVariant('danger')
        setPassword('')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur inattendue est survenue')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="d-flex justify-content-center align-items-center py-5">
      <Card style={{ width: '100%', maxWidth: '420px' }} className="shadow-sm border-0 p-3">
        <Card.Body>
          <div className="text-center mb-4">
            <h2 className="fw-bold">Connexion</h2>
            <p className="text-muted small">Accédez à votre espace MediaSeeker</p>
          </div>

          {error && <Alert variant="danger">{error}</Alert>}
          {alertMessage && <Alert variant={alertVariant}>{alertMessage}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="formEmail">
              <Form.Label>Adresse Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-4" controlId="formPassword">
              <Form.Label>Mot de passe</Form.Label>
              <Form.Control
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Form.Group>

            <Button
              variant="primary"
              type="submit"
              className="w-100 py-2 fw-semibold"
              disabled={isLoading}
            >
              {isLoading ? 'Connexion en cours...' : 'Se connecter'}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </div>
  )
}

export default Login;