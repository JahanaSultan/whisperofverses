import { useEffect, useState } from "react"
import ChapterName from "./ChapterName"
import Loading from "./Loading"

const Main = () => {

  const [chapters, setChapters] = useState([])
  const [loading, setLoading] = useState(true)

  const chaptersName = async () => {
    const response = await fetch('https://cdn.jsdelivr.net/gh/JahanaSultan/quran@latest/json/quran-chapter-info.json')
    const data = await response.json()
    setChapters(data.quran)
    setLoading(false)
  }

  useEffect(() => {
    chaptersName()
  }, [])


  return (
    <main>
      <div className="filter">
      </div>
      <h2>Surələr</h2>
      <ul className="chapters">
        {chapters ? chapters.map((chapter) => (
          <ChapterName key={chapter.chapter} chapter={chapter.chapter} name_az={chapter.name_az} name_ar={chapter.name_ar} verse_count={chapter.verse_count} />
        )) : null}
      </ul>
      {loading && <Loading />}
    </main>
  )
}

export default Main