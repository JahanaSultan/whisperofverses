import { useState, useRef, useEffect, useCallback } from "react";
import { Play, Pause } from "lucide-react";

const BAR_COUNT = 44;

// Gentle sine-wave idle shape so bars aren't flat when paused
const IDLE_BARS = Array.from({ length: BAR_COUNT }, (_, i) => {
	const t = i / BAR_COUNT;
	return Math.max(2, 5 * Math.abs(Math.sin(t * Math.PI * 3.5 + 0.6)) + 1.5);
});

const AudioPlayer = ({ src, onEnded }) => {
	const audioRef    = useRef(null);
	const analyserRef = useRef(null);
	const audioCtxRef = useRef(null);
	const rafRef      = useRef(null);
	const fallback    = useRef(false); // true when captureStream unavailable
	const containerRef = useRef(null);

	const [isPlaying,   setIsPlaying]   = useState(false);
	const [bars,        setBars]        = useState(IDLE_BARS);
	const [currentTime, setCurrentTime] = useState(0);
	const [duration,    setDuration]    = useState(0);

	// ── Audio context setup (captureStream — no CORS needed) ──────────────────
	const setupAudio = () => {
		if (audioCtxRef.current) return;
		try {
			const ctx      = new (window.AudioContext || window.webkitAudioContext)();
			const analyser = ctx.createAnalyser();
			analyser.fftSize              = 256;
			analyser.smoothingTimeConstant = 0.82;

			const audio  = audioRef.current;
			const stream = audio.captureStream?.() ?? audio.mozCaptureStream?.();
			if (!stream) throw new Error("captureStream unavailable");

			ctx.createMediaStreamSource(stream).connect(analyser);
			audioCtxRef.current = ctx;
			analyserRef.current = analyser;
		} catch {
			fallback.current = true;
		}
	};

	// ── Real frequency-analysis draw ──────────────────────────────────────────
	const drawBars = useCallback(() => {
		const analyser = analyserRef.current;
		if (!analyser) return;
		const data = new Uint8Array(analyser.frequencyBinCount);
		analyser.getByteFrequencyData(data);
		const usable = Math.floor(data.length * 0.70);
		const step   = usable / BAR_COUNT;
		setBars(
			Array.from({ length: BAR_COUNT }, (_, i) => {
				const s = Math.floor(i * step);
				const e = Math.max(s + 1, Math.floor((i + 1) * step));
				let sum = 0;
				for (let j = s; j < e; j++) sum += data[j];
				const avg  = sum / (e - s);
				const bell = 0.5 + 0.5 * Math.sin((i / BAR_COUNT) * Math.PI);
				return Math.max(2, (avg / 255) * 36 * bell);
			}),
		);
		rafRef.current = requestAnimationFrame(drawBars);
	}, []);

	// ── Time-based pseudo-random draw (fallback — looks rhythmic without CORS) ─
	const drawFakeBars = useCallback(() => {
		const t = audioRef.current?.currentTime ?? 0;
		setBars(
			Array.from({ length: BAR_COUNT }, (_, i) => {
				const bell = 0.28 + 0.72 * Math.sin((i / BAR_COUNT) * Math.PI);
				const v =
					Math.abs(Math.sin(t * 4.13  + i * 0.58)) * 12 +
					Math.abs(Math.sin(t * 9.37  + i * 1.23)) *  8 +
					Math.abs(Math.sin(t * 17.11 + i * 0.37)) *  5 +
					Math.abs(Math.sin(t * 24.73 + i * 2.09)) *  3;
				return Math.max(2, v * bell);
			}),
		);
		rafRef.current = requestAnimationFrame(drawFakeBars);
	}, []);

	const stopAnimation = useCallback(() => {
		cancelAnimationFrame(rafRef.current);
		rafRef.current = null;
		setBars(IDLE_BARS);
	}, []);

	const startPlay = useCallback(() => {
		setupAudio();
		window.dispatchEvent(new CustomEvent("audio-play", { detail: src }));
		const ctx   = audioCtxRef.current;
		const begin = () => {
			audioRef.current.play();
			setIsPlaying(true);
			fallback.current ? drawFakeBars() : drawBars();
		};
		ctx ? ctx.resume().then(begin) : begin();
	}, [src, drawBars, drawFakeBars]);

	// ── Global: pause when another player starts ──────────────────────────────
	useEffect(() => {
		const handler = (e) => {
			if (e.detail === src) return;
			audioRef.current?.pause();
			setIsPlaying(false);
			stopAnimation();
		};
		window.addEventListener("audio-play", handler);
		return () => window.removeEventListener("audio-play", handler);
	}, [src, stopAnimation]);

	// ── Autoplay-next trigger from Chapter ────────────────────────────────────
	useEffect(() => {
		const handler = (e) => {
			if (e.detail !== src) return;
			containerRef.current
				?.closest("li")
				?.scrollIntoView({ behavior: "smooth", block: "center" });
			startPlay();
		};
		window.addEventListener("audio-autoplay", handler);
		return () => window.removeEventListener("audio-autoplay", handler);
	}, [src, startPlay]);

	useEffect(() => () => {
		cancelAnimationFrame(rafRef.current);
		audioCtxRef.current?.close();
	}, []);

	// ── Controls ──────────────────────────────────────────────────────────────
	const togglePlay = () => {
		if (isPlaying) {
			audioRef.current.pause();
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

	const handleSeek = (e) => {
		if (!duration) return;
		const { left, width } = e.currentTarget.getBoundingClientRect();
		const ratio = Math.max(0, Math.min(1, (e.clientX - left) / width));
		audioRef.current.currentTime = ratio * duration;
		setCurrentTime(ratio * duration);
	};

	const fmt = (s) => {
		if (!s || isNaN(s)) return "0:00";
		return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
	};

	const progress = duration ? currentTime / duration : 0;

	// ── Render ────────────────────────────────────────────────────────────────
	return (
		<div
			ref={containerRef}
			className="border-t border-[rgba(153,88,59,0.25)]"
			style={{ background: "linear-gradient(180deg,#012d3a 0%,#013f4e 100%)" }}
		>
			<audio
				ref={audioRef}
				src={src}
				onTimeUpdate={handleTimeUpdate}
				onLoadedMetadata={() => setDuration(audioRef.current.duration)}
				onEnded={handleEnded}
			/>

			{/* ── Main row ─────────────────────────────── */}
			<div className="flex items-center gap-3 px-3.5 pt-2.5 pb-1.5">

				{/* Play / Pause */}
				<button
					onClick={togglePlay}
					className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200"
					style={{
						background: isPlaying
							? "linear-gradient(135deg,#c9a882,#99583B)"
							: "linear-gradient(145deg,#99583B,#7a4530)",
						boxShadow: isPlaying
							? "0 0 0 2.5px rgba(179,147,117,0.28), 0 0 14px rgba(153,88,59,0.5)"
							: "0 2px 7px rgba(0,0,0,0.45)",
					}}
				>
					{isPlaying
						? <Pause size={11} color="#E4E2DB" />
						: <Play  size={11} color="#E4E2DB" style={{ marginLeft: 1.5 }} />}
				</button>

				{/* Equalizer visualizer */}
				<div
					className="flex-1 flex items-end gap-[1.5px] overflow-hidden"
					style={{
						height: 36,
						filter: isPlaying
							? "drop-shadow(0 0 5px rgba(179,147,117,0.28))"
							: "none",
						transition: "filter 0.5s",
					}}
				>
					{bars.map((h, i) => (
						<div
							key={i}
							className="flex-1 rounded-full"
							style={{
								height: `${Math.min(h, 34)}px`,
								background: isPlaying
									? "linear-gradient(to top,#7a4530,#99583B 38%,#B39375 72%,#e8d5bf)"
									: "linear-gradient(to top,rgba(153,88,59,0.28),rgba(179,147,117,0.18))",
								transition: isPlaying
									? "height 55ms ease"
									: "height 600ms ease, background 500ms ease",
							}}
						/>
					))}
				</div>

				{/* Time */}
				<span className="shrink-0 text-[10px] font-mono tabular-nums tracking-wide"
					style={{ color: "#a07856" }}>
					{fmt(currentTime)}
					<span className="opacity-35 mx-[3px]">/</span>
					{fmt(duration)}
				</span>
			</div>

			{/* ── Seekable progress bar ─────────────────── */}
			<div
				className="mx-3.5 mb-2.5 relative cursor-pointer group"
				style={{ height: 3, borderRadius: 99, background: "rgba(255,255,255,0.07)" }}
				onClick={handleSeek}
			>
				{/* Fill */}
				<div
					className="absolute inset-y-0 left-0 rounded-full"
					style={{
						width: `${progress * 100}%`,
						background: "linear-gradient(to right,#7a4530,#99583B,#B39375)",
						transition: "width 0.12s linear",
						boxShadow: isPlaying ? "0 0 5px rgba(153,88,59,0.45)" : "none",
					}}
				/>
				{/* Scrubber dot (appears on hover) */}
				<div
					className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none"
					style={{
						left: `${progress * 100}%`,
						width: 9,
						height: 9,
						background: "#B39375",
						boxShadow: "0 0 7px rgba(179,147,117,0.7)",
					}}
				/>
			</div>
		</div>
	);
};

export default AudioPlayer;
