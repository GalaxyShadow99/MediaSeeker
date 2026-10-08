import { Badge, Card } from 'react-bootstrap'

export default function CustomCard({
  id,
  title,
  posterPath,
  overview,
  releaseDate,
  mediaType,
  status,
  actionButton,
}) {
  const imageUrl = posterPath
    ? `https://image.tmdb.org/t/p/w500${posterPath}`
    : null

  const releaseYear = releaseDate ? new Date(releaseDate).getFullYear() : null

  return (
    <Card
      data-id={id}
      className="h-100 shadow-sm border-0 rounded-3 overflow-hidden"
    >
      {imageUrl ? (
        <Card.Img
          variant="top"
          src={imageUrl}
          alt={title || 'Media poster'}
          style={{ height: '340px', objectFit: 'cover' }}
        />
      ) : (
        <div
          className="bg-secondary text-white d-flex align-items-center justify-content-center text-center p-3"
          style={{ height: '340px' }}
        >
          <span className="small">Affiche indisponible</span>
        </div>
      )}

      <Card.Body className="d-flex flex-column p-3">
        <div className="d-flex justify-content-between align-items-center mb-2">
          {mediaType && (
            <Badge
              bg={mediaType === 'movie' ? 'primary' : 'info'}
              className="text-uppercase small"
            >
              {mediaType === 'movie' ? 'Film' : 'Série'}
            </Badge>
          )}
          {status && (
            <Badge
              bg={status === 'released' ? 'success' : 'secondary'}
              className="small"
            >
              {status === 'released' ? 'Disponible' : 'À venir'}
            </Badge>
          )}
        </div>

        <Card.Title className="fw-bold fs-6 mb-1 text-truncate" title={title}>
          {title || 'Titre inconnu'}
        </Card.Title>

        {releaseYear && (
          <Card.Subtitle className="text-muted small mb-2">
            {releaseYear}
          </Card.Subtitle>
        )}

        <Card.Text
          className="text-muted small flex-grow-1"
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {overview || 'Aucun résumé disponible.'}
        </Card.Text>

        {actionButton && <div className="mt-3">{actionButton}</div>}
      </Card.Body>
    </Card>
  )
}
