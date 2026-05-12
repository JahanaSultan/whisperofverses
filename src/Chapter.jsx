import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Verse from "./Verse";
import Loading from "./Loading";

const jsonCache = new Map();

const fetchJSON = async (url) => {
	if (jsonCache.has(url)) return jsonCache.get(url);
	const promise = fetch(url).then((res) => res.json());
	jsonCache.set(url, promise);
	return promise;
};

const Chapter = () => {
	const { id } = useParams();
	const [chapterinfo, setchapterinfo] = useState(null);
	const [verses, setVerses] = useState([]);
	const [audios, setAudios] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		setLoading(true);
		const loadDatas = async () => {
			try {
				const [info, ar, az, audio] = await Promise.all([
					fetchJSON(
						"https://cdn.jsdelivr.net/gh/JahanaSultan/quran/json/quran-chapter-info.json",
					),
					fetchJSON(
						"https://cdn.jsdelivr.net/gh/JahanaSultan/quran@latest/json/quran-ar.json",
					),
					fetchJSON(
						"https://cdn.jsdelivr.net/gh/JahanaSultan/quran@latest/json/quran-az.json",
					),
					fetchJSON(
						`https://api.alquran.cloud/v1/surah/${id}/ar.alafasy`,
					),
				]);
				const numId = Number(id);
				const azVerses = az.quran.filter((v) => v.chapter === numId);
				const arVerses = ar.quran.filter((v) => v.chapter === numId);
				setchapterinfo(info.quran.find((c) => c.chapter === numId));
				setVerses(azVerses.map((v, i) => ({ ...v, text_ar: arVerses[i].text })));
				setAudios(audio.data.ayahs);
			} catch (error) {
				console.error(error);
			} finally {
				setLoading(false);
			}
		};
		loadDatas();
	}, [id]);

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
					/>
				))}
			</ul>
			{loading && <Loading />}
		</main>
	);
};

export default Chapter;
