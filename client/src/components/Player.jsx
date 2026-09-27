import { Heart, Pause, Play, Repeat, Repeat1, Shuffle, SkipBack, SkipForward, Volume1, Volume2, VolumeX } from 'lucide-react'

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return '0:00'
  const min = Math.floor(seconds / 60)
  const sec = Math.floor(seconds % 60).toString().padStart(2, '0')
  return `${min}:${sec}`
}

export default function Player({ player, favorite, onFavorite }) {
  const { currentSong, isPlaying, currentTime, duration, volume, shuffle, repeat, togglePlay, previous, next, seek, setVolume, setShuffle, cycleRepeat } = player
  const VolumeIcon = volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2
  const progress = duration ? (currentTime / duration) * 100 : 0

  return (
    <footer className={`player-shell ${currentSong ? 'has-track' : ''}`}>
      <div className="mobile-progress" style={{ '--player-progress': `${progress}%` }} />

      <div className="player-track">
        {currentSong ? (
          <>
            <img src={currentSong.cover} alt="" />
            <div className="player-track-copy"><strong>{currentSong.title}</strong><span>{currentSong.artist}</span></div>
            <button className={`icon-button favorite-player ${favorite ? 'selected' : ''}`} onClick={onFavorite} aria-label="Like current song"><Heart size={17} fill={favorite ? 'currentColor' : 'none'} /></button>
          </>
        ) : <div className="player-empty">Pick a song to start listening</div>}
      </div>

      <div className="player-center">
        <div className="transport">
          <button className={`icon-button secondary-control ${shuffle ? 'selected' : ''}`} onClick={() => setShuffle(!shuffle)} aria-label="Shuffle"><Shuffle size={17} /></button>
          <button className="icon-button" onClick={previous} aria-label="Previous"><SkipBack size={20} fill="currentColor" /></button>
          <button className="main-play" onClick={togglePlay} aria-label={isPlaying ? 'Pause' : 'Play'}>{isPlaying ? <Pause size={21} fill="currentColor" /> : <Play size={21} fill="currentColor" />}</button>
          <button className="icon-button" onClick={next} aria-label="Next"><SkipForward size={20} fill="currentColor" /></button>
          <button className={`icon-button secondary-control ${repeat !== 'off' ? 'selected' : ''}`} onClick={cycleRepeat} aria-label={`Repeat ${repeat}`}>{repeat === 'one' ? <Repeat1 size={17} /> : <Repeat size={17} />}</button>
        </div>
        <div className="timeline">
          <span>{formatTime(currentTime)}</span>
          <input type="range" min="0" max={Math.max(duration, 0)} step="0.1" value={Math.min(currentTime, duration || 0)} onChange={(event) => seek(Number(event.target.value))} style={{ '--progress': `${progress}%` }} aria-label="Seek" />
          <span>{formatTime(duration || currentSong?.duration || 0)}</span>
        </div>
      </div>

      <div className="player-tools">
        <VolumeIcon size={18} />
        <input className="volume-range" type="range" min="0" max="1" step="0.01" value={volume} onChange={(event) => setVolume(Number(event.target.value))} style={{ '--progress': `${volume * 100}%` }} aria-label="Volume" />
      </div>
    </footer>
  )
}
