import { MessageSquareText } from "lucide-react";
import logo from "./assets/img/logo.png";
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const Header = () => {
	const [search, setSearch] = useState("");
	const [verse, setVerse] = useState(null);
	const navigate = useNavigate();

	useEffect(() => {
		fetch(
			"https://cdn.jsdelivr.net/gh/fawazahmed0/quran-api@1/editions/aze-alikhanmusayev.json",
		)
			.then((res) => res.json())
			.then((data) => setVerse(data.quran[Math.floor(Math.random() * 6236)]));
	}, []);

	const handleSearch = () => {
		if (search.trim()) navigate(`/search/${search.trim()}`);
	};

	const handleKeyDown = (e) => {
		if (e.key === "Enter") handleSearch();
	};

	const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

	return (
		<>
			<nav className="padding-x">
				<Link to="/">
					<div className="logo">
						<img src={logo} alt="WoV logo" />
						<h1>WoV</h1>
					</div>
				</Link>
				<div className="search">
					<input
						type="search"
						placeholder="Ayə axtar..."
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						onKeyDown={handleKeyDown}
					/>
					<button type="button" onClick={handleSearch} aria-label="Axtar">
						<i className="ri-search-line"></i>
					</button>
				</div>
			</nav>
			<div className="daily-verse padding-x">
				<h3 className="flex items-center gap-2">
					<MessageSquareText color={"var(--light)"} /> Qurandan Mesajınız Var
				</h3>
				<p>
					{verse
						? `${capitalize(verse.text)} (${verse.verse}:${verse.chapter})`
						: "Yüklənir..."}
				</p>
			</div>
		</>
	);
};

export default Header;
