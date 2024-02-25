import { useEffect, useState } from 'react'
import './App.css'
import axios from 'axios'

function App() {
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [albums, setAlbums] = useState<any[]>([]);

  useEffect(() => {
    axios.get(`http://localhost:3333/albums?page=${page}&limit=${limit}`).then((res) => {
      setAlbums(res.data)
    });
  }, [page, limit]);

  return (
    <div className="App">
      <h1>Albums</h1>
      <div className="limit">
        <label>Limit: </label>
        <select value={limit} onChange={(e) => setLimit(Number(e.target.value))}>
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={30}>30</option>
        </select>
      </div>
      <div className="albums">
        {albums.map((album, index: number) => (
          <div key={index} className="album">
            <a href={album?.href}>
              <img src={album?.images?.[0].url} alt={album?.name} />
              <h2>{album?.name}</h2>
              <p>{album?.artists?.map((artist: any) => artist?.name).join(', ')}</p>
              <p>{album?.release_date}</p>
            </a>
          </div>
        ))}
      </div>

      <div className="pagination">
        <button onClick={() => setPage(page - 1)} disabled={page <= 1}>Previous</button>
        <span>{page}</span>
        <button onClick={() => setPage(page + 1)} disabled={albums.length < limit}>Next</button>
      </div>
    </div>
  )
}

export default App
