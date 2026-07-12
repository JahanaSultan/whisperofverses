import { useMemo, useState } from "react"
import ChapterName from "./ChapterName"
import Loading from "./Loading"
import { useChapterInfo } from "./hooks/useChapterInfo"

const Main = () => {
    const { data, isLoading } = useChapterInfo()
    const [search, setSearch] = useState("")

    const chapters = useMemo(() => {
        const all = data?.quran ?? []
        if (!search) return all
        const val = search.toLowerCase()
        return all.filter(c => c.name_az.toLowerCase().startsWith(val))
    }, [data, search])

    return (
        <main>
            <h2>Surələr</h2>
            <div className="filter">
                <i className="ri-search-line filter-icon"></i>
                <input type="text" placeholder="Surə adını yaz..." onInput={(e) => setSearch(e.target.value)} />
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
            {isLoading && <Loading />}
        </main>
    )
}

export default Main
