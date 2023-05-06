import React from 'react'
import quran from './assets/img/quran.svg'
import { useEffect, useState } from 'react'

const Header = () => {

    const capitalize = (str) => {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    const [verse, setverse] = useState();
    useEffect(() => {
        fetch('https://cdn.jsdelivr.net/gh/fawazahmed0/quran-api@1/editions/aze-alikhanmusayev.json')
            .then((res) => res.json())
            .then((data) => setverse(data.quran[Math.floor(Math.random() * 6236)]))
    }, []);


    return (
        <>
            <nav className="padding-x">
                <a href="index.html">
                    <div className="logo">
                        <h1>WoV<img src={quran} alt="logosvg" /></h1>
                    </div>
                </a>
                <form className="search">
                    <input type="search" name="search" />
                    <button type="submit"><i className="ri-search-line"></i></button>
                </form>
            </nav>
            <div className="daily-verse padding-x">
                <h3><i className="ri-mail-send-line"></i> Mesajınız Var!</h3>
                <p>{verse ? capitalize(verse.text) + " (" + verse.verse + ":" + verse.chapter + ") " : ""}</p>
            </div>
        </>
    )
}

export default Header