import { useState, useRef, useEffect } from "react";
import { Play, Pause } from "lucide-react";

const BARS = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.9];

const AudioPlayer = ({ src }) => {
	const audioRef = useRef(null);
	const [isPlaying, setIsPlaying] = useState(false);

	// Stop this player when another one starts
	useEffect(() => {
		const handleGlobalPlay = (e) => {
			if (e.detail !== src) {
				audioRef.current?.pause();
				setIsPlaying(false);
			}
		};
		window.addEventListener("audio-play", handleGlobalPlay);
		return () => window.removeEventListener("audio-play", handleGlobalPlay);
	}, [src]);

	const togglePlay = () => {
		const audio = audioRef.current;
		if (isPlaying) {
			audio.pause();
			setIsPlaying(false);
		} else {
			window.dispatchEvent(new CustomEvent("audio-play", { detail: src }));
			audio.play();
			setIsPlaying(true);
		}
	};

	const handleEnded = () => setIsPlaying(false);

	return (
		<div className="flex items-center gap-2 px-4 py-2 bg-[#E4E2DB] border-t border-[#C9BFB7]">
			<audio ref={audioRef} src={src} onEnded={handleEnded} />

			{/* Play / Pause */}
			<button
				onClick={togglePlay}
				className="shrink-0 w-7 h-7 rounded-full bg-[#99583B] text-[#E4E2DB] flex items-center justify-center hover:bg-[#013f4e] transition-colors duration-200"
			>
				{isPlaying ? <Pause size={13} /> : <Play size={13} />}
			</button>

			{/* Equalizer bars */}
			<div className="flex items-end gap-0.5 h-5">
				{BARS.map((delay, i) => (
					<div
						key={i}
						className="eq-bar w-0.75 rounded-sm bg-[#99583B]"
						style={{
							animationPlayState: isPlaying ? "running" : "paused",
							animationDelay: `${delay}s`,
						}}
					/>
				))}
			</div>
		</div>
	);
};

export default AudioPlayer;

