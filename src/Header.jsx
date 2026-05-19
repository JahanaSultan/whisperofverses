import {
	ArrowRight,
	MessageSquareText,
	MoveRight,
	Search,
	Settings,
} from "lucide-react";
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
				<div className="header-actions">
					<div className="search">
						<input
							type="search"
							placeholder="Ayə axtar..."
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							onKeyDown={handleKeyDown}
						/>
						<button type="button" onClick={handleSearch} aria-label="Axtar">
							<Search size={18} />
						</button>
					</div>
					<Link
						to="/settings"
						aria-label="Parametrlər"
						className="settings-btn flex items-center justify-center rounded-full transition-colors duration-200 hover:bg-[rgba(228,226,219,0.15)]"
					>
						<Settings size={20} color="var(--light)" />
					</Link>
				</div>
			</nav>
			<div className="daily-verse padding-x flex flex-col items-center gap-2">
				<Link
					to={`/chapter/${verse?.chapter}#verse${verse?.verse}`}
					className="flex items-center gap-2 text-xxl font-semibold text-(--light)"
				>
					<MessageSquareText size={16} color={"var(--light)"} /> Qurandan
					Mesajınız Var <MoveRight size={20} color={"var(--light)"} />
				</Link>

				{verse ? (
					<p className=" flex items-center gap-1">
						<span className="text-(--light)">
							{`${capitalize(verse.text)} (${verse.verse}:${verse.chapter})`}{" "}
						</span>
					</p>
				) : (
					"Yüklənir..."
				)}
			</div>
		</>
	);
};

export default Header;
