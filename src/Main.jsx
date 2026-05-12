import { useEffect, useState } from "react"
import ChapterName from "./ChapterName"
import Loading from "./Loading"

const Main = () => {
    const [chapters, setChapters] = useState([])
    const [chapterHolder, setChapterHolder] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch('https://cdn.jsdelivr.net/gh/JahanaSultan/quran/json/quran-chapter-info.json')
            .then((res) => res.json())
            .then((data) => {
                setChapters(data.quran)
                setChapterHolder(data.quran)
                setLoading(false)
            })
    }, [])

    const findChapter = (e) => {
        const val = e.target.value.toLowerCase()
        setChapters(chapterHolder.filter(c => c.name_az.toLowerCase().startsWith(val)))
    }

    return (
        <main>
            <h2>Surələr</h2>
            <div className="filter">
                <i className="ri-search-line filter-icon"></i>
                <input type="text" placeholder="Surə adını yaz..." onInput={findChapter} />
            </div>
            <ul className="chapters">
                {chapters.map((chapter) => (
                    <ChapterName
                        key={chapter.chapter}
                        chapter={chapter.chapter}
                        name_az={chapter.name_az}
                        name_ar={chapter.name_ar}
                        verse_count={chapter.verse_count}
                    />
                ))}
            </ul>
            {loading && <Loading />}
        </main>
    )
}

export default Main
