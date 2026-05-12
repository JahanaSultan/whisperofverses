import { useEffect, useState, useCallback } from "react";
import { useLocation, useParams } from "react-router-dom";
import Verse from "./Verse";
import Loading from "./Loading";
import { useSettings } from "./SettingsContext";

const jsonCache = new Map();

// Default reciter subfolder on everyayah.com (Alafasy 128kbps)
const DEFAULT_SUBFOLDER = "Alafasy_128kbps";

const fetchJSON = async (url) => {
	if (jsonCache.has(url)) return jsonCache.get(url);
	const promise = fetch(url).then((res) => res.json());
	jsonCache.set(url, promise);
	return promise;
};

/** Build a per-verse audio URL from everyayah.com */
const everyayahUrl = (subfolder, chapter, verse) => {
	const ch  = String(chapter).padStart(3, "0");
	const ver = String(verse).padStart(3, "0");
	return `https://everyayah.com/data/${subfolder}/${ch}${ver}.mp3`;
};

const Chapter = () => {
	const { id } = useParams();
	const location = useLocation();
	const { settings } = useSettings();
	const [chapterinfo, setchapterinfo] = useState(null);
	const [verses, setVerses] = useState([]);
	const [audios, setAudios] = useState([]);
	const [loading, setLoading] = useState(true);

	const handleVerseEnded = useCallback((index) => {
		if (!settings.autoPlayNext) return;
		const nextAudio = audios[index + 1]?.audio;
		if (nextAudio) {
			window.dispatchEvent(new CustomEvent("audio-autoplay", { detail: nextAudio }));
		}
	}, [settings.autoPlayNext, audios]);

	useEffect(() => {
		setLoading(true);
		const loadDatas = async () => {
			try {
				const [info, ar, az] = await Promise.all([
					fetchJSON(
						"https://cdn.jsdelivr.net/gh/JahanaSultan/quran/json/quran-chapter-info.json",
					),
					fetchJSON(
						"https://cdn.jsdelivr.net/gh/JahanaSultan/quran@latest/json/quran-ar.json",
					),
					fetchJSON(
						"https://cdn.jsdelivr.net/gh/JahanaSultan/quran@latest/json/quran-az.json",
					),
				]);

				const numId = Number(id);
				const subfolder = settings.reciterSubfolder || DEFAULT_SUBFOLDER;
				const azVerses = az.quran.filter((v) => v.chapter === numId);
				const arVerses = ar.quran.filter((v) => v.chapter === numId);
				setchapterinfo(info.quran.find((c) => c.chapter === numId));
				setVerses(azVerses.map((v, i) => ({ ...v, text_ar: arVerses[i].text })));
				setAudios(
					azVerses.map((v) => ({
						audio: everyayahUrl(subfolder, numId, v.verse),
					})),
				);
			} catch (error) {
				console.error(error);
			} finally {
				setLoading(false);
			}
		};
		loadDatas();
	}, [id, settings.reciterSubfolder]);

	useEffect(() => {
		if (!verses.length) return;

		const anchorFromLocation = location.hash?.startsWith("#verse")
			? location.hash.slice(1)
			: "";
		const fullHash = window.location.hash || "";
		const nestedIndex = fullHash.lastIndexOf("#verse");
		const anchorFromFullHash = nestedIndex >= 0 ? fullHash.slice(nestedIndex + 1) : "";
		const anchor = anchorFromLocation || anchorFromFullHash;

		if (!anchor) return;

		let attempts = 0;
		const intervalId = window.setInterval(() => {
			const target = document.getElementById(anchor);
			if (target) {
				target.scrollIntoView({ behavior: "smooth", block: "center" });
				window.clearInterval(intervalId);
				return;
			}
			attempts += 1;
			if (attempts >= 8) window.clearInterval(intervalId);
		}, 80);

		return () => window.clearInterval(intervalId);
	}, [verses, location.hash]);

	return (
		<main>
			<h1 className="chapter-name">
				{chapterinfo?.name_az} <span>({chapterinfo?.name_ar})</span>
			</h1>
			<div className="chapter-info">
				<p>
					<span>Ayə sayı:</span> {chapterinfo?.verse_count}
				</p>
				<p>
					<span>Endirilmə sırası:</span> {chapterinfo?.revelation_order}
				</p>
				<p>
					<span>Endirilmə yeri:</span>{" "}
					{chapterinfo?.revelation_place === "Mecca" ? "Məkkə" : "Mədinə"}
				</p>
				<p>
					<span>Yerləşdiyi səhifə:</span> {chapterinfo?.page}
				</p>
			</div>
			<p className="starting">{chapterinfo?.bismillah_pre}</p>
			<ul className="chapter">
				{verses.map((verse, index) => (
					<Verse
						key={verse.verse}
						verse={verse.verse}
						verse_az={verse.text}
						verse_ar={verse.text_ar}
						audio={audios[index]?.audio}
						chapter={chapterinfo?.name_az}
						onEnded={() => handleVerseEnded(index)}
					/>
				))}
			</ul>
			{loading && <Loading />}
		</main>
	);
};

export default Chapter;
