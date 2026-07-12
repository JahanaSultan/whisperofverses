import { useMemo } from "react";
import { useParams } from "react-router-dom"
import Loading from "./Loading";
import Verse from "./Verse";
import { useQuranAz } from "./hooks/useQuranAz";
import { useChapterInfo } from "./hooks/useChapterInfo";

const highlightMatches = (text, query) => {
    const lowerText = text.toLocaleLowerCase("az")
    const lowerQuery = query.toLocaleLowerCase("az")
    if (!lowerQuery) return text
    let result = ""
    let i = 0
    while (true) {
        const idx = lowerText.indexOf(lowerQuery, i)
        if (idx === -1) {
            result += text.slice(i)
            break
        }
        result += text.slice(i, idx) + "<mark>" + text.slice(idx, idx + lowerQuery.length) + "</mark>"
        i = idx + lowerQuery.length
    }
    return result
}

const Search = () => {
    const { query } = useParams()
    const { data: quranAz, isLoading: versesLoading } = useQuranAz()
    const { data: chapterInfo, isLoading: chaptersLoading } = useChapterInfo()
    const loading = versesLoading || chaptersLoading

    const results = useMemo(() => {
        if (!quranAz || !chapterInfo) return []
        const q = query.toLocaleLowerCase("az")
        return quranAz.quran
            .filter(verse => verse.text.toLocaleLowerCase("az").includes(q))
            .map(verse => ({
                ...verse,
                chapterName: chapterInfo.quran.find(ch => ch.chapter === Number(verse.chapter))?.name_az ?? ""
            }))
    }, [quranAz, chapterInfo, query])

    return (
        <main>
            <h1 className="chapter-name">Axtarış nəticələri</h1>
            <ul className="chapter">
                {results.map((verse, index) => (
                    <Verse key={index} verse={verse.verse} verse_az={
                        <div dangerouslySetInnerHTML={{__html: highlightMatches(verse.text, query)}} />
                    } chapter_name={`${verse.chapterName} surəsi`} chapter={verse.chapter} search={true} />
                ))}
            </ul>
            {loading && <Loading />}
        </main>
    )
}

export default Search;
