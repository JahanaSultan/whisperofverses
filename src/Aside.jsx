import DigitalClock from './DigitalClock'
import { useEffect, useState } from "react"
import { month_names, hijri_months, days } from './helper'

const Aside = () => {

  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [error, setError] = useState(null);
  const [praytime, setPraytime] = useState({})
  const [gregorian, setGregorian] = useState("")
  const [hijri, setHijri] = useState("")
  const [weekday, setWeekday] = useState("")

  useEffect(() => {
    const getLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          position => {
            currentCity(position.coords.longitude, position.coords.latitude)
            getPrayTime(position.coords.longitude, position.coords.latitude)
          },
          error => {
            setError(error.message);
          }
        );
      } else {
        setError("Brauzeriniz Lokasiya xidmətini dəstəkləmir");
      }
    };

    getLocation();
  }, []);


  const currentCity = async (long, lat) => {
    if (localStorage.getItem('city') && localStorage.getItem('country')) {
      setCity(localStorage.getItem('city'))
      setCountry(localStorage.getItem('country'))
    }
    else {
      const response = await fetch(`https://api.opencagedata.com/geocode/v1/json?q=${lat}+${long}&key=3e490cfc89ac4cce88823ab10ffd4c59`)
      const data = await response.json()
      localStorage.setItem('city', data.results[0].components.city)
      localStorage.setItem('country', data.results[0].components.country)
      setCity(data.results[0].components.city)
      setCountry(data.results[0].components.country)
    }
  }


  const getPrayTime = async (long, lat) => {
    let today = new Date()
    let day = today.getDate()
    let month = today.getMonth() + 1
    let year = today.getFullYear()
    let weekDay = today.getDay()

    const response = await fetch(`https://api.aladhan.com/v1/calendar/${year}/${month}?latitude=${lat}&longitude=${long}&method=13`)
    const data = await response.json()
    setPraytime({
      "fajr": data.data[day - 1].timings.Fajr.slice(0, 5),
      "sunrise": data.data[day - 1].timings.Sunrise.slice(0, 5),
      "dhuhr": data.data[day - 1].timings.Dhuhr.slice(0, 5),
      "asr": data.data[day - 1].timings.Asr.slice(0, 5),
      "maghrib": data.data[day - 1].timings.Maghrib.slice(0, 5),
      "isha": data.data[day - 1].timings.Isha.slice(0, 5)
    })
    setGregorian(`${day} ${month_names[month - 1]} ${year}`)
    setHijri(`${data.data[day].date.hijri.day} ${hijri_months[data.data[day].date.hijri.month.number - 1]} ${data.data[day].date.hijri.year}`)
    setWeekday(days[weekDay])
  }



  return (
    <aside>
      <h2>Təqvim</h2>
      <div className="today">
        <div className="hijri">
          <h3>Hicri</h3>
          <p>{hijri}</p>
        </div>
        <DigitalClock weekday={weekday} />
        <div className="gregorian">
          <h3>Miladi</h3>
          <p>{gregorian}</p>
        </div>
      </div>
      <div className="prayer-sticky">
        <h2>Namaz Vaxtları</h2>
        <div className="prayer-date">
          {error ? (<h4 id="location">{error}</h4>) : (
            <>
              <h4 id="location">{city}, {country}</h4>
              <ul>
                <li><span>Fəcr</span><span>{praytime?.fajr}</span></li>
                <li><span>Günəş</span><span>{praytime?.sunrise}</span></li>
                <li><span>Zöhr</span><span>{praytime?.dhuhr}</span></li>
                <li><span>Əsr</span><span>{praytime?.asr}</span></li>
                <li><span>Məğrib</span><span>{praytime?.maghrib}</span></li>
                <li><span>İşa</span><span>{praytime?.isha}</span></li>
              </ul>
            </>)}
        </div>
      </div>
    </aside>
  )
}

export default Aside