import { useState } from 'react'
import { Alert, Button, Col, Form, Row } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { API_BASE_URL } from '../config.js'
import { checkToken } from '../utils.js'
import CustomCard from './customCard.jsx'

function AddMedia() {
  const [mediaName, setMediaName] = useState('')
  const [alertMessage, setAlertMessage] = useState('')
  const [alertVariant, setAlertVariant] = useState('danger')
  const [alertVisible, setAlertVisible] = useState(false)
  const [searchResults, setSearchResults] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const token = sessionStorage.getItem('access_token')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setAlertVisible(false)
    setIsLoading(true)

    const isValid = await checkToken()
    if (!isValid) {
      navigate('/login')
      return
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/tmdb/search/${encodeURIComponent(mediaName)}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        },
      )

      if (!response.ok) {
        throw new Error('Erreur lors de la recherche du média')
      }

      const data = await response.json()
      setSearchResults(data.data || [])
    } catch (error) {
      console.error('Fetch error:', error)
      setSearchResults([])
      setAlertMessage(error instanceof Error ? error.message : 'Erreur réseau')
      setAlertVariant('danger')
      setAlertVisible(true)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddMedia = async (tmdbId, mediaType) => {
    try {
      const response = await fetch(`${API_BASE_URL}/media`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          tmdb_id: tmdbId,
          media_type: mediaType || 'movie',
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || data.message || "Erreur lors de l'ajout")
      }

      setAlertMessage('Média ajouté avec succès à votre liste !')
      setAlertVariant('success')
      setAlertVisible(true)
    } catch (error) {
      setAlertMessage(error instanceof Error ? error.message : "Erreur lors de l'ajout")
      setAlertVariant('danger')
      setAlertVisible(true)
    }
  }

  return (
    <div>
      <div className="mx-auto text-center p-3" style={{ maxWidth: '600px' }}>
        <h2 className="fw-bold mb-3">Rechercher et ajouter un média</h2>
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="mediaName">
            <Form.Label className="text-muted small">Nom du film ou de la série</Form.Label>
            <Form.Control
              type="text"
              placeholder="Ex: Interstellar, Breaking Bad..."
              value={mediaName}
              onChange={(e) => setMediaName(e.target.value)}
              required
            />
          </Form.Group>
          <Button type="submit" className="mt-3 px-4" disabled={isLoading}>
            {isLoading ? 'Recherche en cours...' : 'Rechercher sur TMDB'}
          </Button>
        </Form>

        {alertVisible && (
          <Alert variant={alertVariant} className="mt-3">
            {alertMessage}
          </Alert>
        )}
      </div>

      {searchResults.length > 0 && (
        <div className="mt-5">
          <h4 className="fw-bold mb-4">Résultats de la recherche ({searchResults.length})</h4>
          <Row className="g-4">
            {searchResults.map((result) => (
              <Col key={result.id} xs={12} sm={6} md={4} lg={3}>
                <CustomCard
                  id={result.id}
                  title={result.title || result.name}
                  posterPath={result.poster_path || result.backdrop_path}
                  overview={result.overview}
                  releaseDate={result.release_date || result.first_air_date}
                  mediaType={result.media_type}
                  actionButton={
                    <Button
                      variant="primary"
                      size="sm"
                      className="w-100"
                      onClick={() => handleAddMedia(result.id, result.media_type)}
                    >
                      Ajouter à ma liste
                    </Button>
                  }
                />
              </Col>
            ))}
          </Row>
        </div>
      )}
    </div>
  )
}

export default AddMedia
