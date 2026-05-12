import DigitalClock from './DigitalClock'
import { useEffect, useState, useRef } from "react"
import { month_names, hijri_months, days, cities } from './helper'

const todayDate = new Date()
const TODAY_KEY = `${todayDate.getFullYear()}-${todayDate.getMonth()}-${todayDate.getDate()}`

const Aside = () => {
  const [city, setCity] = useState("")
  const [country, setCountry] = useState("")
  const [error, setError] = useState(null)
  const [praytime, setPraytime] = useState(null)
  const [gregorian, setGregorian] = useState("")
  const [hijri, setHijri] = useState("")
  const [weekday, setWeekday] = useState("")
  const [citySearch, setCitySearch] = useState(localStorage.getItem('selected_city') || "")
  const [showCityDropdown, setShowCityDropdown] = useState(false)
  const comboboxRef = useRef(null)

  const applyTimings = (timings) => {
    setPraytime({
      fajr: timings.Fajr.slice(0, 5),
      sunrise: timings.Sunrise.slice(0, 5),
      dhuhr: timings.Dhuhr.slice(0, 5),
      asr: timings.Asr.slice(0, 5),
      maghrib: timings.Maghrib.slice(0, 5),
      isha: timings.Isha.slice(0, 5),
    })
  }

  const applyDate = (hijriData) => {
    const d = new Date()
    setGregorian(`${d.getDate()} ${month_names[d.getMonth()]} ${d.getFullYear()}`)
    setWeekday(days[d.getDay()])
    if (hijriData) {
      setHijri(`${hijriData.day} ${hijri_months[hijriData.month.number - 1]} ${hijriData.year}`)
    }
  }

  const fetchPrayTimeByCity = async (cityName) => {
    try {
      const cacheKey = `praytime_${cityName}_${TODAY_KEY}`
      const cached = localStorage.getItem(cacheKey)
      if (cached) {
        const { timings, hijri: h } = JSON.parse(cached)
        applyTimings(timings)
        applyDate(h)
        setCity(cityName)
        setCountry("Azərbaycan")
        setCitySearch(cityName)
        return
      }
      const res = await fetch(
        `https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(cityName)}&country=AZ&method=13`
      )
      const { data } = await res.json()
      localStorage.setItem(cacheKey, JSON.stringify({ timings: data.timings, hijri: data.date.hijri }))
      applyTimings(data.timings)
      applyDate(data.date.hijri)
      setCity(cityName)
      setCountry("Azərbaycan")
      localStorage.setItem('selected_city', cityName)
      setCitySearch(cityName)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    const currentCity = async (long, lat) => {
      if (localStorage.getItem('city') && localStorage.getItem('country')) {
        setCity(localStorage.getItem('city'))
        setCountry(localStorage.getItem('country'))
      } else {
        const response = await fetch(
          `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${long}&key=3e490cfc89ac4cce88823ab10ffd4c59`
        )
        const data = await response.json()
        localStorage.setItem('city', data.results[0].components.city)
        localStorage.setItem('country', data.results[0].components.country)
        setCity(data.results[0].components.city)
        setCountry(data.results[0].components.country)
      }
    }

    const fetchPrayTimeByCoords = async (lat, long) => {
      try {
        const cacheKey = `praytime_coords_${TODAY_KEY}`
        const cached = localStorage.getItem(cacheKey)
        if (cached) {
          const { timings, hijri: h } = JSON.parse(cached)
          applyTimings(timings)
          applyDate(h)
          return
        }
        const res = await fetch(
          `https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${long}&method=13`
        )
        const { data } = await res.json()
        localStorage.setItem(cacheKey, JSON.stringify({ timings: data.timings, hijri: data.date.hijri }))
        applyTimings(data.timings)
        applyDate(data.date.hijri)
      } catch (err) {
        console.error(err)
      }
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          const { longitude, latitude } = position.coords
          currentCity(longitude, latitude)
          fetchPrayTimeByCoords(latitude, longitude)
        },
        err => {
          switch (err.code) {
            case err.PERMISSION_DENIED:
              setError('Lokasiya məlumatlarına icazə verilmədi. İcazə vermək üçün brauzer ayarlarından dəyişiklik edin.')
              break
            case err.POSITION_UNAVAILABLE:
              setError('Lokasiya məlumatları mövcud deyil.')
              break
            case err.TIMEOUT:
              setError('Lokasiya məlumatlarına gətirmə müddəti bitdi.')
              break
            default:
              setError('Bilinməyən bir səhv baş verdi.')
          }
          applyDate(null)
          const savedCity = localStorage.getItem('selected_city')
          if (savedCity) fetchPrayTimeByCity(savedCity)
        }
      )
    } else {
      setError("Brauzeriniz Lokasiya xidmətini dəstəkləmir")
      applyDate(null)
    }
  }, [])

  useEffect(() => {
    const handler = (e) => {
      if (comboboxRef.current && !comboboxRef.current.contains(e.target))
        setShowCityDropdown(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <aside>
      <h2>Təqvim</h2>
      <div className="today">
        {hijri && (
          <div className="hijri">
            <h3>Hicri</h3>
            <p>{hijri}</p>
          </div>
        )}
        <DigitalClock weekday={weekday} />
        {gregorian && (
          <div className="gregorian">
            <h3>Miladi</h3>
            <p>{gregorian}</p>
          </div>
        )}
      </div>

      <div className="prayer-sticky">
        <h2>Namaz Vaxtları</h2>
        <div className="prayer-date">
          {error ? (
            <>
              <h4 id="location">{error}</h4>
              <label>Şəhər seçin:
                <div className="city-combobox" ref={comboboxRef}>
                  <input
                    type="text"
                    placeholder="Şəhər axtarın..."
                    value={citySearch}
                    onChange={(e) => { setCitySearch(e.target.value); setShowCityDropdown(true) }}
                    onFocus={() => setShowCityDropdown(true)}
                  />
                  {showCityDropdown && (() => {
                    const filtered = cities
                      .filter(c => c.toLowerCase().includes(citySearch.toLowerCase()))
                      .sort()
                    return (
                      <ul className="city-dropdown">
                        {filtered.length > 0
                          ? filtered.map((c, i) => (
                              <li key={i} onMouseDown={() => { fetchPrayTimeByCity(c); setShowCityDropdown(false) }}>{c}</li>
                            ))
                          : <li className="no-results">Şəhər tapılmadı</li>
                        }
                      </ul>
                    )
                  })()}
                </div>
              </label>
              {praytime && (
                <>
                  <h4>{city}, {country}</h4>
                  <ul>
                    <li><span>Fəcr</span><span>{praytime.fajr}</span></li>
                    <li><span>Günəş</span><span>{praytime.sunrise}</span></li>
                    <li><span>Zöhr</span><span>{praytime.dhuhr}</span></li>
                    <li><span>Əsr</span><span>{praytime.asr}</span></li>
                    <li><span>Məğrib</span><span>{praytime.maghrib}</span></li>
                    <li><span>İşa</span><span>{praytime.isha}</span></li>
                  </ul>
                </>
              )}
            </>
          ) : (
            <>
              <h4 id="location">{city}, {country}</h4>
              {praytime ? (
                <ul>
                  <li><span>Fəcr</span><span>{praytime.fajr}</span></li>
                  <li><span>Günəş</span><span>{praytime.sunrise}</span></li>
                  <li><span>Zöhr</span><span>{praytime.dhuhr}</span></li>
                  <li><span>Əsr</span><span>{praytime.asr}</span></li>
                  <li><span>Məğrib</span><span>{praytime.maghrib}</span></li>
                  <li><span>İşa</span><span>{praytime.isha}</span></li>
                </ul>
              ) : (
                <div className="prayer-skeleton">
                  {['Fəcr','Günəş','Zöhr','Əsr','Məğrib','İşa'].map((n) => (
                    <div key={n} className="skeleton-row">
                      <span className="skeleton-bar name"></span>
                      <span className="skeleton-bar time"></span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </aside>
  )
}

export default Aside
