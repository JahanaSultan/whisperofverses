import { Link } from 'react-router-dom'

const Footer = () => {
    return (
        <footer>
            <div className="footer-inner">
                <ul>
                    <Link to="https://www.instagram.com/whisperofverses/" target="_blank" rel="noopener noreferrer">
                        <li><i className="ri-instagram-line"></i></li>
                    </Link>
                    <Link to="#"><li><i className="ri-telegram-line"></i></li></Link>
                </ul>
                <h4><i className="ri-copyright-line"></i> 2023 – {new Date().getFullYear()} Whisper of Verses</h4>
            </div>
        </footer>
    )
}

export default Footer
