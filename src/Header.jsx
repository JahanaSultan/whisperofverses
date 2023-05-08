import React from 'react'
import quran from './assets/img/quran.svg'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'

const Header = () => {

    const capitalize = (str) => {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
    const [search, setSearch] = useState();
    const navigate = useNavigate();
    const [verse, setverse] = useState();
    useEffect(() => {
        fetch('https://cdn.jsdelivr.net/gh/fawazahmed0/quran-api@1/editions/aze-alikhanmusayev.json')
            .then((res) => res.json())
            .then((data) => setverse(data.quran[Math.floor(Math.random() * 6236)]))
    }, []);

    const handleSearch = () => {
        search.trim() && navigate(`/search/${search}`)
    }


    return (
        <>
            <nav className="padding-x">
                <Link to="/">
                    <div className="logo">
                        <h1>WoV<img src={quran} alt="logosvg" /></h1>
                    </div>
                </Link>
                <div className="search" >
                    <input type="search" name="search" onChange={(e) => setSearch(e.target.value)} />
                    <button type="submit" onClick={handleSearch}><i className="ri-search-line"></i></button >
                </div>
            </nav>
            <div className="daily-verse padding-x">
                <h3><i className="ri-mail-send-line"></i> Mesajınız Var!</h3>
                <p>{verse ? (`${capitalize(verse.text)} (${verse.verse}:${verse.chapter})`) : null}</p>
            </div>
        </>
    )
}

export default Header