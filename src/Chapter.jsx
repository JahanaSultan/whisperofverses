import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import Verse from './Verse'
import Loading from './Loading'

const Chapter = () => {
    const { id } = useParams()
    const [chapterinfo, setchapterinfo] = useState("")
    const [verses, setVerses] = useState([])
    const [verses_ar, setVerses_ar] = useState([])
    const [audios, setAudios] = useState([])
    const [loading, setLoading] = useState(true)

    const loadDatas = async () => {
        try {
            const [info, ar, az, audio] = await Promise.all([
                fetch('https://cdn.jsdelivr.net/gh/JahanaSultan/quran/json/quran-chapter-info.json').then(res => res.json()),
                fetch(`https://cdn.jsdelivr.net/gh/JahanaSultan/quran@latest/json/quran-ar.json`).then(res => res.json()),
                fetch(`https://cdn.jsdelivr.net/gh/JahanaSultan/quran@latest/json/quran-az.json`).then(res => res.json()),
                fetch(`https://api.alquran.cloud/v1/surah/${id}/ar.alafasy`).then(res => res.json())
            ]);
            setchapterinfo(info.quran.find(chapter => chapter.chapter === Number(id)))
            setVerses(az.quran.filter(chapter => chapter.chapter === Number(id)))
            setVerses_ar(ar.quran.filter(chapter => chapter.chapter === Number(id)))
            setAudios(audio.data.ayahs)
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadDatas()
    })
    return (
        <main>
            <h1 className="chapter-name">{chapterinfo?.name_az} <span>({chapterinfo?.name_ar})</span></h1>
            <div className="chapter-info">
                <p><span>Ayə sayı:</span> {chapterinfo?.verse_count}</p>
                <p><span>Endirilmə sırası:</span> {chapterinfo?.revelation_order}</p>
                <p><span>Endirilmə yeri:</span> {chapterinfo?.revelation_place === "Mecca" ? "Məkkə" : "Mədinə"}</p>
                <p><span>Yerləşdiyi səhifə:</span> {chapterinfo?.page}</p>
            </div>
            <p className="starting">{chapterinfo?.bismillah_pre}</p>
            <ul className="chapter">
                {verses?.map((verse, index) => (<Verse key={verse.verse} verse={verse.verse} verse_az={verse.text} verse_ar={verses_ar[index].text} audio={audios[index]?.audio} chapter={chapterinfo?.name_az} />))}
            </ul>
            {loading && <Loading />}
        </main>
    )
}

export default Chapter