import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <footer>
    <ul>
      <Link to="#"><li><i className="ri-instagram-line"></i></li></Link>
      <Link to="#"><li><i className="ri-telegram-line"></i></li></Link>
    </ul> 
    <h4><i className="ri-copyright-line"></i> 2023</h4>
  </footer>

  )
}

export default Footer