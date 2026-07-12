import DigitalClock from "./DigitalClock";
import { useEffect, useMemo, useState, useRef } from "react";
import { month_names, hijri_months, days, cities } from "./helper";
import { Link, useLocation } from "react-router-dom";
import { usePrayerTimes } from "./hooks/usePrayerTimes";

const Aside = () => {
	const location = useLocation();
	const isMainPage = location.pathname === "/";
	const [lastRead, setLastRead] = useState(() => {
		try {
			return JSON.parse(localStorage.getItem("last_read"));
		} catch {
			return null;
		}
	});
	const [city, setCity] = useState(() => localStorage.getItem("selected_city") || "");
	const [citySearch, setCitySearch] = useState(
		localStorage.getItem("selected_city") || "",
	);
	const [showCityDropdown, setShowCityDropdown] = useState(false);
	const comboboxRef = useRef(null);

	const { data: prayerData } = usePrayerTimes(city);

	const praytime = useMemo(() => {
		if (!prayerData) return null;
		const { timings } = prayerData;
		return {
			fajr: timings.Fajr.slice(0, 5),
			sunrise: timings.Sunrise.slice(0, 5),
			dhuhr: timings.Dhuhr.slice(0, 5),
			asr: timings.Asr.slice(0, 5),
			maghrib: timings.Maghrib.slice(0, 5),
			isha: timings.Isha.slice(0, 5),
		};
	}, [prayerData]);

	const gregorian = useMemo(() => {
		const d = new Date();
		return `${d.getDate()} ${month_names[d.getMonth()]} ${d.getFullYear()}`;
	}, []);

	const weekday = useMemo(() => days[new Date().getDay()], []);

	const hijri = useMemo(() => {
		const hijriData = prayerData?.hijri;
		if (!hijriData) return "";
		return `${hijriData.day} ${hijri_months[hijriData.month.number - 1]} ${hijriData.year}`;
	}, [prayerData]);

	const selectCity = (cityName) => {
		setCity(cityName);
		setCitySearch(cityName);
		localStorage.setItem("selected_city", cityName);
	};

	useEffect(() => {
		const handler = (e) => {
			if (comboboxRef.current && !comboboxRef.current.contains(e.target))
				setShowCityDropdown(false);
		};
		document.addEventListener("mousedown", handler);
		return () => document.removeEventListener("mousedown", handler);
	}, []);

	useEffect(() => {
		if (isMainPage) {
			try {
				setLastRead(JSON.parse(localStorage.getItem("last_read")));
			} catch {
				/* ignore */
			}
		}
	}, [isMainPage]);

	return (
		<aside>
			{isMainPage && lastRead && (
				<div className="last-read">
					<h2>Son oxunan</h2>
					<Link
						to={`/chapter/${lastRead.chapterId}#verse${lastRead.verse}`}
						className="last-read-link"
					>
						<span className="last-read-chapter">{lastRead.chapterNameAz}</span>
						<span className="last-read-ar">{lastRead.chapterNameAr}</span>
						<span className="last-read-verse">{lastRead.verse}. ayə</span>
					</Link>
				</div>
			)}
			<h2 className="text-[var(--light)] text-xl font-bold text-center">Təqvim</h2>
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
				<h2 className="text-[var(--light)] text-xl font-bold text-center mb-4">Namaz Vaxtları</h2>
				<div className="prayer-date">
					<label>
						Şəhər seçin:
						<div className="city-combobox" ref={comboboxRef}>
							<input
								type="text"
								placeholder="Şəhər axtarın..."
								value={citySearch}
								onChange={(e) => {
									setCitySearch(e.target.value);
									setShowCityDropdown(true);
								}}
								onFocus={() => setShowCityDropdown(true)}
							/>
							{showCityDropdown &&
								(() => {
									const filtered = cities
										.filter((c) =>
											c.toLowerCase().includes(citySearch.toLowerCase()),
										)
										.sort();
									return (
										<ul className="city-dropdown">
											{filtered.length > 0 ? (
												filtered.map((c, i) => (
													<li
														key={i}
														onMouseDown={() => {
															selectCity(c);
															setShowCityDropdown(false);
														}}
													>
														{c}
													</li>
												))
											) : (
												<li className="no-results">Şəhər tapılmadı</li>
											)}
										</ul>
									);
								})()}
						</div>
					</label>
					{city && <h4 id="location">{city}</h4>}
					{praytime ? (
						<ul>
							<li>
								<span>Fəcr</span>
								<span>{praytime.fajr}</span>
							</li>
							<li>
								<span>Günəş</span>
								<span>{praytime.sunrise}</span>
							</li>
							<li>
								<span>Zöhr</span>
								<span>{praytime.dhuhr}</span>
							</li>
							<li>
								<span>Əsr</span>
								<span>{praytime.asr}</span>
							</li>
							<li>
								<span>Məğrib</span>
								<span>{praytime.maghrib}</span>
							</li>
							<li>
								<span>İşa</span>
								<span>{praytime.isha}</span>
							</li>
						</ul>
					) : city ? (
						<div className="prayer-skeleton">
							{["Fəcr", "Günəş", "Zöhr", "Əsr", "Məğrib", "İşa"].map((n) => (
								<div key={n} className="skeleton-row">
									<span className="skeleton-bar name"></span>
									<span className="skeleton-bar time"></span>
								</div>
							))}
						</div>
					) : null}
				</div>
			</div>
		</aside>
	);
};

export default Aside;
