import { useState, useRef, useEffect, useCallback } from "react";
import { Play, Pause } from "lucide-react";

const BAR_COUNT = 50;
const IDLE_BARS = Array(BAR_COUNT).fill(3);

const AudioPlayer = ({ src, onEnded }) => {
	const audioRef = useRef(null);
	const analyserRef = useRef(null);
	const audioCtxRef = useRef(null);
	const rafRef = useRef(null);
	const useCssAnim = useRef(false);
	const containerRef = useRef(null);

	const [isPlaying, setIsPlaying] = useState(false);
	const [bars, setBars] = useState(IDLE_BARS);
	const [currentTime, setCurrentTime] = useState(0);
	const [duration, setDuration] = useState(0);

	// captureStream() taps into the already-playing audio — no CORS needed.
	const setupAudio = () => {
		if (audioCtxRef.current) return;
		try {
			const ctx = new (window.AudioContext || window.webkitAudioContext)();
			const analyser = ctx.createAnalyser();
			analyser.fftSize = 128;
			analyser.smoothingTimeConstant = 0.8;
			const stream = audioRef.current.captureStream();
			const source = ctx.createMediaStreamSource(stream);
			source.connect(analyser);
			audioCtxRef.current = ctx;
			analyserRef.current = analyser;
		} catch {
			useCssAnim.current = true;
		}
	};

	const drawBars = useCallback(() => {
		const analyser = analyserRef.current;
		if (!analyser) return;
		const binCount = analyser.frequencyBinCount;
		const dataArray = new Uint8Array(binCount);
		analyser.getByteFrequencyData(dataArray);
		const usable = Math.floor(binCount * 0.75);
		const step = usable / BAR_COUNT;
		setBars(
			Array.from({ length: BAR_COUNT }, (_, i) => {
				const start = Math.floor(i * step);
				const end = Math.max(start + 1, Math.floor((i + 1) * step));
				let sum = 0;
				for (let j = start; j < end; j++) sum += dataArray[j];
				const avg = sum / (end - start);
				return Math.max(3, (avg / 255) * 24);
			}),
		);
		rafRef.current = requestAnimationFrame(drawBars);
	}, []);

	const stopAnimation = useCallback(() => {
		cancelAnimationFrame(rafRef.current);
		rafRef.current = null;
		setBars(IDLE_BARS);
	}, []);

	const startPlay = useCallback(() => {
		setupAudio();
		window.dispatchEvent(new CustomEvent("audio-play", { detail: src }));
		const ctx = audioCtxRef.current;
		const begin = () => {
			audioRef.current.play();
			setIsPlaying(true);
			if (!useCssAnim.current) drawBars();
		};
		ctx ? ctx.resume().then(begin) : begin();
	}, [src, drawBars]);

	useEffect(() => {
		const onGlobalPlay = (e) => {
			if (e.detail !== src) {
				audioRef.current?.pause();
				setIsPlaying(false);
				stopAnimation();
			}
		};
		window.addEventListener("audio-play", onGlobalPlay);
		return () => window.removeEventListener("audio-play", onGlobalPlay);
	}, [src, stopAnimation]);

	// Listen for autoplay-next trigger from Chapter
	useEffect(() => {
		const onAutoPlay = (e) => {
			if (e.detail !== src) return;
			containerRef.current?.closest("li")?.scrollIntoView({ behavior: "smooth", block: "center" });
			startPlay();
		};
		window.addEventListener("audio-autoplay", onAutoPlay);
		return () => window.removeEventListener("audio-autoplay", onAutoPlay);
	}, [src, startPlay]);

	useEffect(() => {
		return () => {
			cancelAnimationFrame(rafRef.current);
			audioCtxRef.current?.close();
		};
	}, []);

	const togglePlay = () => {
		const audio = audioRef.current;
		if (isPlaying) {
			audio.pause();
			setIsPlaying(false);
			stopAnimation();
		} else {
			startPlay();
		}
	};

	const handleTimeUpdate = () => {
		const a = audioRef.current;
		if (!isNaN(a.duration) && a.duration > 0) setCurrentTime(a.currentTime);
	};

	const handleEnded = () => {
		setIsPlaying(false);
		setCurrentTime(0);
		stopAnimation();
		onEnded?.();
	};

	const fmt = (t) => {
		if (!t || isNaN(t)) return "0:00";
		return `${Math.floor(t / 60)}:${Math.floor(t % 60)
			.toString()
			.padStart(2, "0")}`;
	};

	const CSS_DELAYS = useRef(
		Array.from({ length: BAR_COUNT }, (_, i) => +(i * 0.04).toFixed(2)),
	);

	return (
		<div ref={containerRef} className="relative overflow-hidden bg-[#013f4e] border-t border-[rgba(153,88,59,0.4)]">
			{/* Playback progress underlay */}
			<div
				className="absolute inset-0 origin-left bg-[rgba(153,88,59,0.18)] pointer-events-none"
				style={{
					transform: `scaleX(${duration ? currentTime / duration : 0})`,
					transition: "transform 0.1s linear",
				}}
			/>

			<div className="relative flex items-center gap-3 px-4 py-2.5">
				<audio
					ref={audioRef}
					src={src}
					onTimeUpdate={handleTimeUpdate}
					onLoadedMetadata={() => setDuration(audioRef.current.duration)}
					onEnded={handleEnded}
				/>

				{/* Play / Pause */}
				<button
					onClick={togglePlay}
					className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg"
					style={{
						background: isPlaying
							? "linear-gradient(135deg,#B39375,#99583B)"
							: "linear-gradient(135deg,#99583B,#7a4530)",
						boxShadow: isPlaying
							? "0 0 0 3px rgba(179,147,117,0.35), 0 4px 12px rgba(0,0,0,0.4)"
							: "0 4px 12px rgba(0,0,0,0.3)",
					}}
				>
					{isPlaying
						? <Pause size={14} color="#E4E2DB" />
						: <Play size={14} color="#E4E2DB" style={{ marginLeft: 2 }} />}
				</button>

				{/* Equalizer bars */}
				<div
					className="flex-1 flex items-end h-9 gap-px"
					style={{ filter: isPlaying ? "drop-shadow(0 0 5px rgba(179,147,117,0.45))" : "none", transition: "filter 0.4s" }}
				>
					{bars.map((height, i) =>
						useCssAnim.current ? (
							<div
								key={i}
								className="eq-bar flex-1 rounded-t-full"
								style={{
									animationPlayState: isPlaying ? "running" : "paused",
									animationDelay: `${CSS_DELAYS.current[i]}s`,
									animationDuration: `${0.5 + (i % 9) * 0.07}s`,
									background: "linear-gradient(to top, #99583B, #B39375 55%, #E4E2DB)",
									opacity: isPlaying ? 1 : 0.3,
									transition: "opacity 0.4s",
								}}
							/>
						) : (
							<div
								key={i}
								className="flex-1 rounded-t-full"
								style={{
									height: `${height}px`,
									background: "linear-gradient(to top, #99583B, #B39375 55%, #E4E2DB)",
									transition: "height 55ms ease",
									opacity: height > 5 ? 1 : 0.3,
								}}
							/>
						),
					)}
				</div>

				{/* Time */}
				<span className="shrink-0 text-[11px] text-[#B39375] tabular-nums font-mono tracking-wide">
					{fmt(currentTime)}
					<span className="opacity-40 mx-px">/</span>
					{fmt(duration)}
				</span>
			</div>
		</div>
	);
};

export default AudioPlayer;
