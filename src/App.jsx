import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';
import Main from './Main';
import './assets/css/style.css';
import Aside from './Aside';
import Chapter from './Chapter';
import Search from './Search';
import BacktoTop from './BacktoTop';
import Settings from './Settings';
import { SettingsProvider } from './SettingsContext';

function App() {
  const loc = useLocation();
  const onTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }

  useEffect(() => {
    onTop()
  }, [loc]);
  return (
    <SettingsProvider>
      <div className='overlay'>
        <Header />
        <div className="container padding-x">
          <Routes>
            <Route path='/' element={<Main />} />
            <Route path='/chapter/:id' element={<Chapter />} />
            <Route path='/search/:query' element={<Search />} />
            <Route path='/settings' element={<Settings />} />
          </Routes>
          <Aside />
        </div>
        <BacktoTop/>
        <Footer />
      </div>
    </SettingsProvider>
  );
}

export default App;
