import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

export function useAudioPlayer(songs, onTrackStart) {
  const audioRef = useRef(new Audio())
  const [currentId, setCurrentId] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(0.82)
  const [shuffle, setShuffle] = useState(false)
  const [repeat, setRepeat] = useState('off')

  const currentSong = useMemo(
    () => songs.find((song) => song.id === currentId) || null,
    [songs, currentId],
  )

  const currentIndex = useMemo(
    () => songs.findIndex((song) => song.id === currentId),
    [songs, currentId],
  )

  useEffect(() => {
    const audio = audioRef.current
    const updateTime = () => setCurrentTime(audio.currentTime || 0)
    const updateDuration = () => setDuration(Number.isFinite(audio.duration) ? audio.duration : 0)
    const pause = () => setIsPlaying(false)
    const play = () => setIsPlaying(true)

    audio.addEventListener('timeupdate', updateTime)
    audio.addEventListener('loadedmetadata', updateDuration)
    audio.addEventListener('durationchange', updateDuration)
    audio.addEventListener('pause', pause)
    audio.addEventListener('play', play)

    return () => {
      audio.pause()
      audio.removeEventListener('timeupdate', updateTime)
      audio.removeEventListener('loadedmetadata', updateDuration)
      audio.removeEventListener('durationchange', updateDuration)
      audio.removeEventListener('pause', pause)
      audio.removeEventListener('play', play)
    }
  }, [])

  useEffect(() => {
    audioRef.current.volume = volume
  }, [volume])

  const chooseNextId = useCallback(() => {
    if (!songs.length) return null
    if (shuffle && songs.length > 1) {
      const candidates = songs.filter((song) => song.id !== currentId)
      return candidates[Math.floor(Math.random() * candidates.length)].id
    }
    if (currentIndex < 0 || currentIndex === songs.length - 1) return songs[0].id
    return songs[currentIndex + 1].id
  }, [songs, shuffle, currentId, currentIndex])

  const playSong = useCallback(async (song) => {
    if (!song) return
    const audio = audioRef.current

    if (song.id !== currentId) {
      audio.src = song.audio
      audio.currentTime = 0
      setCurrentId(song.id)
      setCurrentTime(0)
      onTrackStart?.(song)
    }

    try {
      await audio.play()
    } catch (error) {
      console.error('Audio playback failed:', error)
    }
  }, [currentId, onTrackStart])

  const togglePlay = useCallback(async () => {
    const audio = audioRef.current
    if (!currentSong) {
      if (songs[0]) await playSong(songs[0])
      return
    }
    if (audio.paused) await audio.play()
    else audio.pause()
  }, [currentSong, songs, playSong])

  const next = useCallback(async () => {
    const id = chooseNextId()
    const nextSong = songs.find((song) => song.id === id)
    if (nextSong) await playSong(nextSong)
  }, [chooseNextId, songs, playSong])

  const previous = useCallback(async () => {
    const audio = audioRef.current
    if (audio.currentTime > 4) {
      audio.currentTime = 0
      return
    }
    if (!songs.length) return
    const index = currentIndex <= 0 ? songs.length - 1 : currentIndex - 1
    await playSong(songs[index])
  }, [currentIndex, songs, playSong])

  useEffect(() => {
    const audio = audioRef.current
    const ended = async () => {
      if (repeat === 'one') {
        audio.currentTime = 0
        await audio.play()
        return
      }
      if (repeat === 'all' || currentIndex < songs.length - 1 || shuffle) {
        await next()
      } else {
        setIsPlaying(false)
      }
    }

    audio.addEventListener('ended', ended)
    return () => audio.removeEventListener('ended', ended)
  }, [repeat, currentIndex, songs.length, shuffle, next])

  const seek = (time) => {
    audioRef.current.currentTime = time
    setCurrentTime(time)
  }

  const cycleRepeat = () => {
    setRepeat((value) => value === 'off' ? 'all' : value === 'all' ? 'one' : 'off')
  }

  return {
    currentSong,
    currentId,
    isPlaying,
    currentTime,
    duration,
    volume,
    shuffle,
    repeat,
    playSong,
    togglePlay,
    next,
    previous,
    seek,
    setVolume,
    setShuffle,
    cycleRepeat,
  }
}
