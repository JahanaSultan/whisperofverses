import { useEffect, useMemo, useCallback, useRef } from "react";
import { useLocation, useParams } from "react-router-dom";
import Verse from "./Verse";
import Loading from "./Loading";
import { useSettings } from "./SettingsContext";
import { useChapterInfo } from "./hooks/useChapterInfo";
import { useQuranAz } from "./hooks/useQuranAz";
import { useQuranAr } from "./hooks/useQuranAr";

// Default reciter subfolder on everyayah.com (Alafasy 128kbps)
const DEFAULT_SUBFOLDER = "Alafasy_128kbps";

/** Build a per-verse audio URL from everyayah.com */
const everyayahUrl = (subfolder, chapter, verse) => {
	const ch = String(chapter).padStart(3, "0");
	const ver = String(verse).padStart(3, "0");
	return `https://everyayah.com/data/${subfolder}/${ch}${ver}.mp3`;
};

const Chapter = () => {
	const { id } = useParams();
	const location = useLocation();
	const { settings } = useSettings();
	const chapterinfoRef = useRef(null);

	const { data: chapterInfoData, isLoading: infoLoading } = useChapterInfo();
	const { data: quranAzData, isLoading: azLoading } = useQuranAz();
	const { data: quranArData, isLoading: arLoading } = useQuranAr();
	const loading = infoLoading || azLoading || arLoading;

	const numId = Number(id);
	const subfolder = settings.reciterSubfolder || DEFAULT_SUBFOLDER;

	const chapterinfo = useMemo(
		() => chapterInfoData?.quran.find((c) => c.chapter === numId),
		[chapterInfoData, numId],
	);
	chapterinfoRef.current = chapterinfo;

	const verses = useMemo(() => {
		if (!quranAzData || !quranArData) return [];
		const azVerses = quranAzData.quran.filter((v) => v.chapter === numId);
		const arVerses = quranArData.quran.filter((v) => v.chapter === numId);
		return azVerses.map((v, i) => ({ ...v, text_ar: arVerses[i].text }));
	}, [quranAzData, quranArData, numId]);

	const audios = useMemo(
		() =>
			verses.map((v) => ({
				audio: everyayahUrl(subfolder, numId, v.verse),
			})),
		[verses, subfolder, numId],
	);

	const handleVerseEnded = useCallback(
		(index) => {
			if (!settings.autoPlayNext) return;
			const nextAudio = audios[index + 1]?.audio;
			if (nextAudio) {
				window.dispatchEvent(
					new CustomEvent("audio-autoplay", { detail: nextAudio }),
				);
			}
		},
		[settings.autoPlayNext, audios],
	);

	useEffect(() => {
		if (!verses.length) return;

		const anchorFromLocation = location.hash?.startsWith("#verse")
			? location.hash.slice(1)
			: "";
		const fullHash = window.location.hash || "";
		const nestedIndex = fullHash.lastIndexOf("#verse");
		const anchorFromFullHash =
			nestedIndex >= 0 ? fullHash.slice(nestedIndex + 1) : "";
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

	useEffect(() => {
		if (!verses.length || !chapterinfo) return;

		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						const verseNum = parseInt(entry.target.id.replace("verse", ""), 10);
						const info = chapterinfoRef.current;
						if (info) {
							localStorage.setItem(
								"last_read",
								JSON.stringify({
									chapterId: info.chapter,
									chapterNameAz: info.name_az,
									chapterNameAr: info.name_ar,
									verse: verseNum,
								}),
							);
						}
					}
				});
			},
			{ threshold: 0.5 },
		);

		const verseEls = document.querySelectorAll("li[id^='verse']");
		verseEls.forEach((el) => observer.observe(el));

		return () => observer.disconnect();
	}, [verses, chapterinfo]);

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
