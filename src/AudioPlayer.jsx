import { useState, useRef, useEffect } from "react";
import { Play, Pause } from "lucide-react";

const EQ_BAR_COUNT = 114;
const EQ_BARS = Array.from({ length: EQ_BAR_COUNT }, (_, i) => ({
	id: i,
	duration: `${0.7 + (i % 9) * 0.12}s`,
	delay: `${(i % 6) * 0.08}s`,
}));

const MINUTE_THEMES = [
	{
		wave: ["#4EC9FF", "#5CE6C6", "#FFE08A"],
		muted: ["rgba(78,201,255,0.22)", "rgba(92,230,198,0.18)", "rgba(255,224,138,0.18)"],
		glow: "rgba(92,230,198,0.35)",
	},
	{
		wave: ["#8B7CFF", "#C58CFF", "#FFB3D4"],
		muted: ["rgba(139,124,255,0.22)", "rgba(197,140,255,0.18)", "rgba(255,179,212,0.18)"],
		glow: "rgba(197,140,255,0.35)",
	},
	{
		wave: ["#45D18B", "#A5F16E", "#F0D35E"],
		muted: ["rgba(69,209,139,0.22)", "rgba(165,241,110,0.18)", "rgba(240,211,94,0.18)"],
		glow: "rgba(69,209,139,0.35)",
	},
	{
		wave: ["#FF8A5B", "#FFB56B", "#FFD28A"],
		muted: ["rgba(255,138,91,0.22)", "rgba(255,181,107,0.18)", "rgba(255,210,138,0.18)"],
		glow: "rgba(255,181,107,0.35)",
	},
];

const buildGradient = (colors, direction = "to top") =>
	`linear-gradient(${direction}, ${colors[0]}, ${colors[1]} 45%, ${colors[2]})`;

const AudioPlayer = ({ src, onEnded }) => {
	const audioRef = useRef(null);
	const containerRef = useRef(null);

	const [isPlaying, setIsPlaying] = useState(false);
	const [currentTime, setCurrentTime] = useState(0);
	const [duration, setDuration] = useState(0);

	const startPlay = () => {
		window.dispatchEvent(new CustomEvent("audio-play", { detail: src }));
		const playPromise = audioRef.current.play();
		if (playPromise?.then) {
			playPromise.then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
			return;
		}
		setIsPlaying(true);
	};

	// ── Global: pause when another player starts ──────────────────────────────
	useEffect(() => {
		const handler = (e) => {
			if (e.detail === src) return;
			audioRef.current?.pause();
			setIsPlaying(false);
		};
		window.addEventListener("audio-play", handler);
		return () => window.removeEventListener("audio-play", handler);
	}, [src]);

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
	}, [src]);

	// ── Controls ──────────────────────────────────────────────────────────────
	const togglePlay = () => {
		if (isPlaying) {
			audioRef.current.pause();
			setIsPlaying(false);
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
		onEnded?.();
	};

	const fmt = (s) => {
		if (!s || isNaN(s)) return "0:00";
		return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
	};

	const progress = duration ? currentTime / duration : 0;
	const playedBars = Math.floor(progress * EQ_BAR_COUNT);
	const elapsedMinutes = Math.floor(currentTime / 60);
	const minuteTheme = MINUTE_THEMES[elapsedMinutes % MINUTE_THEMES.length];
	const waveGradient = buildGradient(minuteTheme.wave);
	const mutedGradient = buildGradient(minuteTheme.muted);

	// ── Render ────────────────────────────────────────────────────────────────
	return (
		<div
			ref={containerRef}
			className="border-t border-[rgba(255,255,255,0.06)]"
			style={{
				background: "linear-gradient(180deg,#041b24 0%,#072734 45%,#03151c 100%)",
				boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
			}}
		>
			<audio
				ref={audioRef}
				src={src}
				onTimeUpdate={handleTimeUpdate}
				onLoadedMetadata={() => setDuration(audioRef.current.duration)}
				onEnded={handleEnded}
			/>

			{/* ── Main row ─────────────────────────────── */}
			<div className="flex items-center gap-3 px-3.5 py-1">

				{/* Play / Pause */}
				<button
					onClick={togglePlay}
					className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200"
					style={{
						background: isPlaying
							? `linear-gradient(135deg,${minuteTheme.wave[0]},${minuteTheme.wave[1]})`
							: "linear-gradient(145deg,#0f2a35,#163746)",
						boxShadow: isPlaying
							? `0 0 0 2.5px ${minuteTheme.glow}, 0 0 16px ${minuteTheme.glow}`
							: "0 2px 8px rgba(0,0,0,0.55)",
					}}
				>
					{isPlaying
						? <Pause size={11} color="#E4E2DB" />
						: <Play  size={11} color="#E4E2DB" style={{ marginLeft: 1.5 }} />}
				</button>

				{/* Equalizer visualizer */}
				<div
					className="flex-1 flex items-end justify-between gap-px overflow-hidden"
					style={{
						height: 16,
						filter: isPlaying
							? `drop-shadow(0 0 6px ${minuteTheme.glow})`
							: "none",
						transition: "filter 0.5s",
					}}
				>
					{EQ_BARS.map((bar) => {
						const passed = bar.id < playedBars;
						return (
						<div
							key={bar.id}
							className="w-0.5 h-4 shrink-0 rounded-full origin-bottom"
							style={{
								background: passed ? waveGradient : mutedGradient,
								transition: "background 500ms ease",
								animationName: "eqPulse",
								animationTimingFunction: "ease-in-out",
								animationIterationCount: "infinite",
								animationPlayState: isPlaying ? "running" : "paused",
								animationDelay: bar.delay,
								animationDuration: bar.duration,
							}}
						/>
						);
					})}
				</div>

				{/* Time */}
				<span className="shrink-0 text-[10px] font-mono tabular-nums tracking-wide"
					style={{ color: minuteTheme.wave[1] }}>
					{fmt(currentTime)}
					<span className="opacity-35 mx-[3px]">/</span>
					{fmt(duration)}
				</span>
			</div>

			<div className="h-2" />
		</div>
	);
};

export default AudioPlayer;
