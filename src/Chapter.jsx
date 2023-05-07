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

    const quran_info = async () => {
        const response = await fetch('https://cdn.jsdelivr.net/gh/JahanaSultan/quran@latest/json/quran-chapter-info.json')
        const data = await response.json()
        const chapter = data.quran.find(chapter => chapter.chapter === Number(id))
        setchapterinfo(chapter)
    }

    const quran_az = async () => {
        const response = await fetch(`https://cdn.jsdelivr.net/gh/JahanaSultan/quran@latest/json/quran-az.json`)
        const data = await response.json()
        setVerses(data.quran.filter(chapter => chapter.chapter === Number(id)))
    }

    const quran_ar = async () => {
        const response = await fetch(`https://cdn.jsdelivr.net/gh/JahanaSultan/quran@latest/json/quran-ar.json`)
        const data = await response.json()
        setVerses_ar(data.quran.filter(chapter => chapter.chapter === Number(id)))
    }

    const quran_audio = async () => {
        const response = await fetch(`http://api.alquran.cloud/v1/surah/${id}/ar.alafasy`)
        const data = await response.json()
        setAudios(data.data.ayahs)
    }

    useEffect(() => {
        quran_info()
        quran_az()
        quran_ar()
        quran_audio()
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
                {verses?.map((verse, index) => (<Verse key={verse.verse} verse={verse.verse} verse_az={verse.text} verse_ar={verses_ar[index].text} audio={audios[index]?.audio} />))}
            </ul>
        </main>
    )
}

export default Chapter