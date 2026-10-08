import { Badge, Button, Card, Col, Container, Row } from 'react-bootstrap'

export default function About() {
  const techStack = [
    { name: 'FastAPI', category: 'Backend', variant: 'success', description: 'API REST asynchrone Python' },
    { name: 'Python 3.12', category: 'Backend', variant: 'success', description: 'Backend moderne et typé' },
    { name: 'SQLite (WAL)', category: 'Database', variant: 'secondary', description: 'Stockage léger et performant' },
    { name: 'Pydantic v2', category: 'Backend', variant: 'success', description: 'Validation stricte des schémas' },
    { name: 'JWT & Bcrypt', category: 'Sécurité', variant: 'danger', description: 'Authentification et hachage' },
    { name: 'SlowAPI', category: 'Sécurité', variant: 'danger', description: 'Protection contre les abus' },
    { name: 'React 19', category: 'Frontend', variant: 'primary', description: 'Interface utilisateur réactive' },
    { name: 'React-Bootstrap 5', category: 'Frontend', variant: 'primary', description: 'Système de design responsive' },
    { name: 'Vite 8', category: 'Outillage', variant: 'warning', description: 'Serveur de développement rapide' },
    { name: 'uv', category: 'Outillage', variant: 'warning', description: 'Gestionnaire de paquets Python' },
  ]

  const featureList = [
    {
      title: 'Intégration TMDB',
      text: 'Connexion directe à TheMovieDB pour récupérer résumés, affiches et détails en temps réel.',
    },
    {
      title: 'Base de données relationnelles',
      text: 'Requêtes SQL paramétrées directes sans ORM.',
    },
    {
      title: 'Contrôle des accès',
      text: 'Sécurisation des routes par jetons JWT Bearer.',
    },
  ]

  return (
    <Container className="py-2">
      {/* Hero section */}
      <div className="p-5 mb-5 bg-white rounded-4 shadow-sm border text-center">
        <Badge bg="primary" className="px-3 py-2 fs-6 mb-3 rounded-pill">
          Projet Open Source
        </Badge>
        <h1 className="display-4 fw-bold mb-3">À propos de MediaSeeker</h1>
        <p className="lead text-muted mx-auto" style={{ maxWidth: '750px' }}>
          MediaSeeker est une plateforme full-stack de recherche et de gestion de médias conçue pour être prévenu au moment de la sortie de vos films et séries préférés ajoutés en liste de surveillance.
        </p>
        <div className="d-flex justify-content-center gap-3 mt-4">
          <Button
            as="a"
            href="https://github.com/GalaxyShadow99/MediaSeeker"
            target="_blank"
            rel="noopener noreferrer"
            variant="dark"
            size="lg"
            className="px-4 shadow-sm"
          >
            Dépôt GitHub
          </Button>
        </div>
      </div>

      {/* Core features */}
      <div className="mb-5">
        <h2 className="text-center justify-content-center fw-bold mb-4">Fonctionnalités</h2>
        <Row className="g-4">
          {featureList.map((item, index) => (
            <Col md={6} lg={4} key={index}>
              <Card className="h-100 border-0 shadow-sm p-3 rounded-4 bg-white">
                <Card.Body>
                  <Card.Title className="fw-bold fs-5 mb-2">{item.title}</Card.Title>
                  <Card.Text className="text-muted small">{item.text}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      {/* Architecture and tech stack */}
      <div className="p-4 p-md-5 mb-5 bg-white rounded-4 shadow-sm border">
        <div className="text-center mb-4">
          <h2 className="fw-bold">Technologies utilisées</h2>
          <p className="text-muted">Composants sélectionnés pour leur stabilité et leur performance</p>
        </div>

        <Row className="g-3">
          {techStack.map((tech, index) => (
            <Col sm={6} md={4} lg={3} key={index}>
              <div className="p-3 border rounded-3 bg-light h-100 d-flex flex-column justify-content-center align-items-center">
                <div>
                  <div className="d-flex justify-content-center align-items-center mb-2">
                    <span className="fw-bold">{tech.name}</span>
                  </div>
                  <p className="text-muted small mb-0">{tech.description}</p>
                </div>
              </div>
            </Col>
          ))}
        </Row>
      </div>

    </Container>
  )
}