import {useEffect, useState} from 'react'
import { useParams } from 'react-router-dom'

const Chapter = () => {
    const { slug } = useParams()

    const quranAz = async () => {
        const response = await fetch('https://cdn.jsdelivr.net/gh/JahanaSultan/quran@latest/json/quran-chapter-info.json')
        const data = await response.json()
        data.quran.find(chapter=>chapter.transliteration.toLowerCase() === slug)
    }

    useEffect(() => {
        quranAz()
    }, [])




    return (
        <div>Chapter</div>
    )
}

export default Chapter