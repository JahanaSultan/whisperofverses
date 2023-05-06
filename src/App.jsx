import { Routes, Route } from 'react-router-dom'
import Header from './Header';
import Footer from './Footer';
import Main from './Main';
import './assets/css/style.css';
import Aside from './Aside';

function App() {
  return (
    <div className='overlay'>
      <Header />
      <div className="container padding-x">
      <Routes>
        <Route path='/' element={<Main/>} />
      </Routes>
      <Aside/>
      </div>
      <Footer />
    </div>
  );
}

export default App;
