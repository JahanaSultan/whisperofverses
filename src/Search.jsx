import { useEffect, useState } from "react";
import { useParams } from "react-router-dom"
import Loading from "./Loading";
import Verse from "./Verse";

const Search = () => {
    const { query } = useParams()
    const [search, setSearch] = useState([])
    const [names, setNames] = useState([])
    const [loading, setLoading] = useState(true)
    const searchWord = async () => {
        try {
            const [word, chapterInfo] = await Promise.all([
                fetch(`https://cdn.jsdelivr.net/gh/JahanaSultan/quran@latest/json/quran-az.json`).then(res => res.json()),
                fetch(`https://cdn.jsdelivr.net/gh/JahanaSultan/quran@latest/json/quran-chapter-info.json`).then(res => res.json())
            ]);
            const filteredVerses = word.quran.filter(verse => verse.text.includes(query))
            setSearch(filteredVerses)
            const chapterNames = filteredVerses.map(verse => chapterInfo.quran.find(chapter => chapter.chapter === Number(verse.chapter)).name_az)
            setNames(chapterNames)
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }
    useEffect(() => {
        searchWord()
    }, [query])
    
    return (
        <main>
            <h1 className="chapter-name">Axtarış nəticələri</h1>
            <ul className="chapter">
                {search?.map((verse, index) => (
                    <Verse key={index} verse={verse.verse} verse_az={verse.text} verse_ar={names[index]} />
                ))}
            </ul>
            {loading && <Loading />}
        </main>
    )
}

export default Search;
