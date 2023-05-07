import { Routes, Route } from 'react-router-dom'
import Header from './Header';
import Footer from './Footer';
import Main from './Main';
import './assets/css/style.css';
import Aside from './Aside';
import Chapter from './Chapter';
import Search from './Search';

function App() {
  return (
    <div className='overlay'>
      <Header />
      <div className="container padding-x">
      <Routes>
        <Route path='/' element={<Main/>} />
        <Route path='/chapter/:id' element={<Chapter/>} />
        <Route path='/search/:query' element={<Search/>} />
      </Routes>
      <Aside/>
      </div>
      <Footer />
    </div>
  );
}

export default App;
