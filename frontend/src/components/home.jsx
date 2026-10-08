import { useEffect, useState } from 'react'
import { Button, Col, Row } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { API_BASE_URL } from '../config.js'
import CustomCard from './customCard.jsx'

export default function Home() {
  const [medias, setMedias] = useState([])
  const token = sessionStorage.getItem('access_token')

  useEffect(() => {
    if (!token) return

    fetch(`${API_BASE_URL}/media`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((res) => setMedias(res.data || []))
      .catch((err) => console.error('Fetch error:', err))
  }, [token])

  if (!token) {
    return (
      <div className="text-center p-5 bg-white rounded shadow-sm">
        <h1>Bienvenue sur MediaSeeker</h1>
        <p className="text-muted mt-2">Connectez-vous pour accéder à vos médias.</p>
        <Button as={Link} to="/login" variant="primary" className="mt-2">
          Se connecter
        </Button>
      </div>
    )
  }

  const cards = []
  medias.forEach((item) => {
    cards.push(
      <Col key={item.id} xs={12} sm={6} md={3}>
        <CustomCard
          id={item.id}
          title={item.title}
          posterPath={item.poster_path}
          overview={item.overview}
          releaseDate={item.release_date}
          mediaType={item.media_type}
          status={item.status}
        />
      </Col>
    )
  })

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold mb-0">Mes Médias</h2>
        <Button as={Link} to="/new" variant="primary" size="sm">
          Ajouter un média
        </Button>
      </div>
      <Row className="g-3">{cards}</Row>
    </div>
  )
}
