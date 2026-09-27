async function request(path, options = {}) {
  const response = await fetch(path, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  })

  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new Error(body.error || `Request failed: ${response.status}`)
  }

  return response.status === 204 ? null : response.json()
}

export const api = {
  bootstrap: () => request('/api/bootstrap'),
  addFavorite: (songId) => request(`/api/favorites/${songId}`, { method: 'PUT' }),
  removeFavorite: (songId) => request(`/api/favorites/${songId}`, { method: 'DELETE' }),
  addHistory: (songId) => request('/api/history', {
    method: 'POST',
    body: JSON.stringify({ songId }),
  }),
  createPlaylist: (name) => request('/api/playlists', {
    method: 'POST',
    body: JSON.stringify({ name }),
  }),
  addToPlaylist: (playlistId, songId) => request(`/api/playlists/${playlistId}/songs`, {
    method: 'POST',
    body: JSON.stringify({ songId }),
  }),
  removeFromPlaylist: (playlistId, songId) => request(`/api/playlists/${playlistId}/songs/${songId}`, {
    method: 'DELETE',
  }),
}
