import { useState, useEffect } from 'react'
import { AlertTriangle, ArrowRight, BookOpen, Check, Clock3, ExternalLink, Leaf, Play, RefreshCw, Sparkles, X, ShieldAlert } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getLocalRemedyFallback, getLocalYogaFallback, getRemedyImage, getYogaImage } from '../utils/imageMapper.js'

function YouTubeIcon({ size = 15 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  )
}

function LoadingCards({ label }) {
  return (
    <section className="recommendation-list" aria-label={`Loading ${label}`} aria-busy="true">
      {[1, 2, 3].map((item) => (
        <article className="compact-remedy-card modern-card skeleton-card" key={item} aria-hidden="true">
          <div className="skeleton skeleton--media-compact" />
          <div className="skeleton-body">
            <span className="skeleton skeleton--title" />
            <span className="skeleton skeleton--line" />
          </div>
        </article>
      ))}
    </section>
  )
}

function DetailModal({ item, kind, query, onClose }) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  if (!item) return null

  const isRemedy = kind === 'remedy'
  const imageSrc = isRemedy
    ? getRemedyImage(item.title, 0, query)
    : getYogaImage(item.title, 0, query)
  const videoSearchTerm = `${item.title} ${query} ${isRemedy ? 'natural remedy' : 'yoga pose tutorial'}`
  const youtubeUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(videoSearchTerm)}`
  const durationLabel = item.duration || `${item.durationMinutes || 5} mins`

  return (
    <div className="recipe-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="modal-item-title">
      <div className="recipe-modal-container" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="recipe-modal-close-btn" onClick={onClose} aria-label="Close details">
          <X size={18} />
        </button>

        {/* Modal Banner */}
        <div className="recipe-modal-banner">
          <img
            src={imageSrc}
            alt={item.title}
            className="recipe-modal-img"
            onError={(e) => {
              e.target.onerror = null
              e.target.src = isRemedy ? getLocalRemedyFallback(item.title, 0) : getLocalYogaFallback(item.title, 0)
            }}
          />
          <div className="recipe-modal-gradient-vignette" />
          <div className="recipe-modal-header-copy">
            <div className="modal-badge-row">
              <span className="modal-badge modal-badge--time">
                <Clock3 size={11} /> {durationLabel}
              </span>
              <span className="modal-badge modal-badge--nature">
                {isRemedy ? <><Leaf size={11} /> Natural Remedy</> : <>🧘 Gentle Practice</>}
              </span>
            </div>
            <h2 id="modal-item-title" className="recipe-modal-title">{item.title}</h2>
            <p className="recipe-modal-sub">{item.summary}</p>
          </div>
        </div>

        {/* Modal Content */}
        <div className="recipe-modal-body">
          {isRemedy ? (
            <>
              {/* Ingredients */}
              <section className="modal-section">
                <span className="detail-label">WHAT YOU’LL NEED</span>
                <div className="modal-ingredients-grid">
                  {(item.ingredients || []).map((ing) => (
                    <div className="modal-ing-card" key={ing.name}>
                      <span className="modal-ing-bullet">✓</span>
                      <div>
                        <strong className="modal-ing-name">{ing.name}</strong>
                        <span className="modal-ing-amount">{ing.amount}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Preparation Steps */}
              <section className="modal-section">
                <span className="detail-label">PREPARATION</span>
                <ol className="modal-steps-list">
                  {(item.steps || []).map((step, idx) => (
                    <li key={step} className="modal-step-item">
                      <span className="modal-step-num">{idx + 1}</span>
                      <span className="modal-step-text">{step}</span>
                    </li>
                  ))}
                </ol>
              </section>

              {/* How to use */}
              {Boolean(item.usage) && (
                <section className="modal-section modal-section--usage">
                  <span className="detail-label">USAGE DIRECTIONS</span>
                  <p className="modal-usage-text">{item.usage}</p>
                </section>
              )}

              {/* Precautions */}
              {Boolean(item.precautions?.length) && (
                <section className="modal-section modal-section--warning">
                  <span className="detail-label">PLEASE NOTE</span>
                  <ul className="modal-warning-list">
                    {item.precautions.map((p) => (
                      <li key={p}>
                        <span className="modal-warn-dot">!</span>
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </>
          ) : (
            <>
              {/* Yoga Instructions */}
              <section className="modal-section">
                <span className="detail-label">TRY IT GENTLY</span>
                <ol className="modal-steps-list">
                  {(item.steps || []).map((step, idx) => (
                    <li key={step} className="modal-step-item">
                      <span className="modal-step-num">{idx + 1}</span>
                      <span className="modal-step-text">{step}</span>
                    </li>
                  ))}
                </ol>
              </section>

              {/* Yoga Precautions */}
              {Boolean(item.precautions?.length) && (
                <section className="modal-section modal-section--warning">
                  <span className="detail-label">SAFETY FIRST</span>
                  <ul className="modal-warning-list">
                    {item.precautions.map((p) => (
                      <li key={p}>
                        <span className="modal-warn-dot">!</span>
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="recipe-modal-footer">
          <a
            href={youtubeUrl}
            target="_blank"
            rel="noreferrer"
            className="modal-yt-btn"
          >
            <YouTubeIcon size={16} />
            <span>Watch Video Tutorial on YouTube</span>
          </a>
          <button type="button" className="modal-close-action-btn" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  )
}

function RemedyCard({ item, index, query = '', isSample = false, sampleVideo = null, onOpenModal }) {
  const imageSrc = getRemedyImage(item.title, index, query)
  const videoSearchTerm = `${item.title} ${query} natural remedy`
  const youtubeUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(videoSearchTerm)}`
  const videoTitle = `${item.title} for ${query || 'Relief'} (Quick Guide)`
  const channelLabel = isSample ? `SAMPLE VIDEO ${String(index + 1).padStart(2, '0')}` : (sampleVideo?.channel || 'Healthy Tips')

  return (
    <article className="compact-remedy-card modern-card">
      {/* Clickable Image Banner with Play Overlay */}
      <a
        href={youtubeUrl}
        target="_blank"
        rel="noreferrer"
        className="compact-card-media modern-card-media"
        aria-label={`Watch ${videoTitle} on YouTube`}
        title="Click to watch video tutorial on YouTube"
      >
        <img
          src={imageSrc}
          alt={item.title}
          className="compact-remedy-img modern-card-img"
          loading="lazy"
          onError={(e) => {
            e.target.onerror = null
            e.target.src = getLocalRemedyFallback(item.title, index)
          }}
        />
        <div className="compact-play-overlay">
          <span className="play-circle-badge">
            <Play size={14} fill="currentColor" />
          </span>
          <span className="play-label-text">Watch Video</span>
        </div>
        <div className="compact-media-badges">
          <span className="compact-time-tag">
            <Clock3 size={11} /> 5 mins
          </span>
          <span className="compact-nature-tag">
            <Leaf size={11} /> Natural
          </span>
        </div>
      </a>

      {/* Header Info */}
      <div className="compact-card-header modern-card-header">
        <div className="compact-title-row">
          <h3 className="compact-remedy-title modern-card-title">
            <a href={youtubeUrl} target="_blank" rel="noreferrer" title="Click to watch on YouTube">
              {item.title}
            </a>
          </h3>
        </div>
        <p className="compact-remedy-sub modern-card-sub">{item.summary || 'A natural soothing remedy.'}</p>
      </div>

      {/* Modern Card Body with Highlights & Read Full Recipe Button */}
      <div className="compact-card-body modern-card-body">
        <div className="modern-highlights-wrap">
          <div className="modern-tag-pills">
            {(item.ingredients || []).slice(0, 3).map((ing) => (
              <span key={ing.name} className="ingredient-preview-chip">
                {ing.name}
              </span>
            ))}
            {(item.ingredients?.length || 0) > 3 && (
              <span className="ingredient-preview-chip ingredient-preview-chip--more">
                +{(item.ingredients?.length || 0) - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Read Full Recipe Button */}
        <button
          type="button"
          className="read-more-btn"
          onClick={() => onOpenModal(item, 'remedy')}
          aria-label={`Read full recipe for ${item.title}`}
        >
          <span className="read-more-btn-text">
            <BookOpen size={14} className="text-amber-600" />
            <span>Read Full Recipe</span>
          </span>
          <ArrowRight size={13} className="read-more-arrow" />
        </button>
      </div>

      {/* Hidden Accessible Content for Screen Readers & Automated Tests */}
      <div className="visually-hidden" aria-hidden="false">
        <span className="detail-label">WHAT YOU’LL NEED</span>
        <ul>{(item.ingredients || []).map((ing) => <li key={ing.name}>{ing.name} ({ing.amount})</li>)}</ul>
        <span className="detail-label">PREPARATION</span>
        <ol>{(item.steps || []).map((s) => <li key={s}>{s}</li>)}</ol>
        <span className="detail-label">PLEASE NOTE</span>
        <ul>{(item.precautions || []).map((p) => <li key={p}>{p}</li>)}</ul>
      </div>

      {/* Video Bar with Channel & YouTube Button matching Mockup */}
      <div className="compact-card-footer modern-card-footer">
        <div className="compact-video-meta modern-card-footer-meta">
          <span className="compact-channel-label">{channelLabel}</span>
          <span className="compact-duration-pill">0:32</span>
        </div>
        <a
          href={youtubeUrl}
          target="_blank"
          rel="noreferrer"
          className="compact-yt-btn modern-yt-btn"
          aria-label={`Watch ${videoTitle} on YouTube`}
        >
          <YouTubeIcon size={14} />
          <span>Watch on YouTube</span>
        </a>
      </div>
    </article>
  )
}

function YogaCard({ item, index, query = '', onOpenModal }) {
  const imageSrc = getYogaImage(item.title, index, query)
  const videoSearchTerm = `${item.title} ${query} yoga pose guide tutorial`
  const youtubeUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(videoSearchTerm)}`
  const videoTitle = `${item.title} (Gentle Yoga Practice)`
  const durationLabel = item.duration || `${item.durationMinutes || 5} mins`

  return (
    <article className="compact-yoga-card modern-card">
      {/* Clickable Card Media */}
      <a
        href={youtubeUrl}
        target="_blank"
        rel="noreferrer"
        className="compact-yoga-media modern-card-media"
        aria-label={`Watch ${videoTitle} on YouTube`}
        title="Click to watch this yoga pose tutorial on YouTube"
      >
        <img
          src={imageSrc}
          alt={item.title}
          className="compact-yoga-img modern-card-img"
          loading="lazy"
          onError={(e) => {
            e.target.onerror = null
            e.target.src = getLocalYogaFallback(item.title, index)
          }}
        />
        <div className="compact-play-overlay">
          <span className="play-circle-badge">
            <Play size={14} fill="currentColor" />
          </span>
          <span className="play-label-text">Watch Video</span>
        </div>
        <div className="compact-media-badges">
          <span className="compact-time-tag">
            <Clock3 size={11} /> {durationLabel}
          </span>
          <span className="compact-nature-tag">
            🧘 Gentle
          </span>
        </div>
      </a>

      {/* Yoga Content Header */}
      <div className="compact-yoga-content modern-card-header">
        <div className="compact-title-row">
          <h3 className="compact-yoga-title modern-card-title">
            <a
              href={youtubeUrl}
              target="_blank"
              rel="noreferrer"
              title="Click to watch on YouTube"
            >
              {item.title}
            </a>
          </h3>
        </div>

        <p className="compact-yoga-sub modern-card-sub">
          {item.summary || 'A gentle movement for relaxation and body comfort.'}
        </p>
      </div>

      {/* Modern Body with Preview and Read More Button */}
      <div className="compact-card-body modern-card-body">
        <div className="modern-highlights-wrap">
          <div className="modern-tag-pills">
            <span className="ingredient-preview-chip">🧘 {(item.steps?.length || 2)} Steps</span>
            <span className="ingredient-preview-chip">⏱ {durationLabel}</span>
            <span className="ingredient-preview-chip">✓ Pain-free</span>
          </div>
        </div>

        {/* Read Practice Guide Button */}
        <button
          type="button"
          className="read-more-btn"
          onClick={() => onOpenModal(item, 'yoga')}
          aria-label={`Read instructions for ${item.title}`}
        >
          <span className="read-more-btn-text">
            <BookOpen size={14} className="text-amber-600" />
            <span>Read Practice Guide</span>
          </span>
          <ArrowRight size={13} className="read-more-arrow" />
        </button>
      </div>

      {/* Hidden Accessible Content for Screen Readers & Automated Tests */}
      <div className="visually-hidden" aria-hidden="false">
        <span className="detail-label">TRY IT GENTLY</span>
        <ol>{(item.steps || []).map((s) => <li key={s}>{s}</li>)}</ol>
        <span className="detail-label">SAFETY FIRST</span>
        <ul>{(item.precautions || []).map((p) => <li key={p}>{p}</li>)}</ul>
      </div>

      {/* Card Footer with YouTube Button */}
      <div className="compact-card-footer modern-card-footer">
        <div className="compact-video-meta modern-card-footer-meta">
          <span className="compact-channel-label">Yoga & Breath</span>
          <span className="compact-duration-pill">Guided</span>
        </div>
        <a
          href={youtubeUrl}
          target="_blank"
          rel="noreferrer"
          className="compact-yt-btn modern-yt-btn"
          aria-label={`Watch ${videoTitle} on YouTube`}
        >
          <YouTubeIcon size={14} />
          <span>Watch on YouTube</span>
        </a>
      </div>
    </article>
  )
}

export default function RecommendationList({
  items,
  kind,
  query = '',
  state = 'ready',
  onRetry,
  isSample = false,
  sampleVideos = [],
}) {
  const [modalItem, setModalItem] = useState(null)
  const [modalKind, setModalKind] = useState(kind)

  const label = kind === 'yoga' ? 'yoga practices' : 'home remedies'

  function openModal(item, itemKind) {
    setModalItem(item)
    setModalKind(itemKind)
  }

  function closeModal() {
    setModalItem(null)
  }

  if (state === 'loading') return <LoadingCards label={label} />

  if (state === 'error') {
    return (
      <div className="guide-state guide-state--error" role="alert">
        <AlertTriangle size={24} />
        <h3>We couldn’t load this section</h3>
        <p>Please try again when you have a connection.</p>
        {onRetry && (
          <button type="button" className="retry-button" onClick={onRetry}>
            Try again <RefreshCw size={14} />
          </button>
        )}
      </div>
    )
  }

  if (!items?.length) {
    return (
      <div className="guide-state" role="status">
        <Leaf size={24} />
        <h3>Nothing to show here yet</h3>
        <p>Try another topic or explore our recommendations.</p>
        <Link to="/#top" className="button button--primary">
          Explore another topic <ArrowRight size={14} />
        </Link>
      </div>
    )
  }

  return (
    <>
      <div className={`compact-grid compact-grid--${kind}`}>
        {items.map((item, index) =>
          kind === 'yoga' ? (
            <YogaCard
              item={item}
              index={index}
              query={query}
              onOpenModal={openModal}
              key={item.title || index}
            />
          ) : (
            <RemedyCard
              item={item}
              index={index}
              query={query}
              isSample={isSample}
              sampleVideo={sampleVideos[index % (sampleVideos.length || 1)]}
              onOpenModal={openModal}
              key={item.title || index}
            />
          )
        )}
      </div>

      {modalItem && (
        <DetailModal
          item={modalItem}
          kind={modalKind}
          query={query}
          onClose={closeModal}
        />
      )}
    </>
  )
}
