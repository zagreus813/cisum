import { Play } from 'lucide-react'

export default function MediaCard({ image, title, subtitle, eyebrow, onPlay, onOpen }) {
  return (
    <article className="media-card" onClick={onOpen} tabIndex={0} role="button">
      <div className="media-art-wrap">
        <img className="media-art" src={image} alt="" loading="lazy" />
        {onPlay && (
          <button className="floating-play" onClick={(event) => { event.stopPropagation(); onPlay() }} aria-label={`Play ${title}`}>
            <Play size={18} fill="currentColor" />
          </button>
        )}
      </div>
      {eyebrow && <span className="card-eyebrow">{eyebrow}</span>}
      <h3>{title}</h3>
      <p>{subtitle}</p>
    </article>
  )
}
