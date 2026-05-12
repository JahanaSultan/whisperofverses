import { useState, useRef, useEffect, useCallback } from "react";
import { Play, Pause } from "lucide-react";

const BAR_COUNT = 56;

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
	const fallback    = useRef(false); // true when analyser unavailable
	const silentFramesRef = useRef(0);
	const containerRef = useRef(null);

	const [isPlaying,   setIsPlaying]   = useState(false);
	const [bars,        setBars]        = useState(IDLE_BARS);
	const [currentTime, setCurrentTime] = useState(0);
	const [duration,    setDuration]    = useState(0);

	// ── Audio context setup ────────────────────────────────────────────────────
	const setupAudio = () => {
		if (audioCtxRef.current) return;
		try {
			const ctx      = new (window.AudioContext || window.webkitAudioContext)();
			const analyser = ctx.createAnalyser();
			analyser.fftSize = 512;
			analyser.smoothingTimeConstant = 0.7;

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

	// ── Real frequency-analysis draw ──────────────────────────────────────────
	const drawBars = useCallback(() => {
		const analyser = analyserRef.current;
		if (!analyser) return;

		const data = new Uint8Array(analyser.frequencyBinCount);
		analyser.getByteFrequencyData(data);

		const usable = Math.floor(data.length * 0.82);
		const step   = usable / BAR_COUNT;

		let maxEnergy = 0;
		for (let i = 0; i < usable; i++) {
			if (data[i] > maxEnergy) maxEnergy = data[i];
		}

		if (maxEnergy === 0 && (audioRef.current?.currentTime ?? 0) > 0.4) {
			silentFramesRef.current += 1;
		} else {
			silentFramesRef.current = 0;
		}

		// Only fallback when analyser is completely flat for a sustained period.
		if (silentFramesRef.current > 48) {
			fallback.current = true;
			silentFramesRef.current = 0;
			rafRef.current = requestAnimationFrame(drawFakeBars);
			return;
		}

		setBars(
			Array.from({ length: BAR_COUNT }, (_, i) => {
				const s = Math.floor(i * step);
				const e = Math.max(s + 1, Math.floor((i + 1) * step));
				let sum = 0;
				for (let j = s; j < e; j++) sum += data[j];
				const avg  = sum / (e - s);
				const bell = 0.58 + 0.42 * Math.sin((i / BAR_COUNT) * Math.PI);
				return Math.max(2, (avg / 255) * 34 * bell);
			}),
		);
		rafRef.current = requestAnimationFrame(drawBars);
	}, [drawFakeBars]);

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
			cancelAnimationFrame(rafRef.current);
			rafRef.current = null;
			silentFramesRef.current = 0;
			fallback.current = !analyserRef.current;
			const runVisualizer = () => {
				setIsPlaying(true);
				fallback.current ? drawFakeBars() : drawBars();
			};
			const playPromise = audioRef.current.play();
			if (playPromise?.then) {
				playPromise.then(runVisualizer).catch(() => {
					setIsPlaying(false);
					stopAnimation();
				});
			} else {
				runVisualizer();
			}
		};
		ctx ? ctx.resume().then(begin, begin) : begin();
	}, [src, drawBars, drawFakeBars, stopAnimation]);

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
	const elapsedMinutes = Math.floor(currentTime / 60);
	const minuteTheme = MINUTE_THEMES[elapsedMinutes % MINUTE_THEMES.length];
	const waveGradient = buildGradient(minuteTheme.wave);
	const mutedGradient = buildGradient(minuteTheme.muted);
	const progressGradient = buildGradient(minuteTheme.wave, "to right");

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
			<div className="flex items-center gap-3 px-3.5 pt-3 pb-2">

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
					className="flex-1 flex items-end justify-between gap-pxoverflow-hidden"
					style={{
						height: 38,
						filter: isPlaying
							? `drop-shadow(0 0 6px ${minuteTheme.glow})`
							: "none",
						transition: "filter 0.5s",
					}}
				>
					{bars.map((h, i) => (
						<div
							key={i}
							className="w-[2px] shrink-0 rounded-full"
							style={{
								height: `${Math.min(h, 34)}px`,
								background: isPlaying
									? waveGradient
									: mutedGradient,
								transition: isPlaying
									? "height 55ms ease"
									: "height 600ms ease, background 500ms ease",
							}}
						/>
					))}
				</div>

				{/* Time */}
				<span className="shrink-0 text-[10px] font-mono tabular-nums tracking-wide"
					style={{ color: minuteTheme.wave[1] }}>
					{fmt(currentTime)}
					<span className="opacity-35 mx-[3px]">/</span>
					{fmt(duration)}
				</span>
			</div>

			{/* ── Seekable progress bar ─────────────────── */}
			<div
				className="mx-3.5 mb-2.5 relative cursor-pointer group"
				style={{ height: 3, borderRadius: 99, background: "rgba(255,255,255,0.08)" }}
				onClick={handleSeek}
			>
				{/* Fill */}
				<div
					className="absolute inset-y-0 left-0 rounded-full"
					style={{
						width: `${progress * 100}%`,
						background: progressGradient,
						transition: "width 0.12s linear",
						boxShadow: isPlaying ? `0 0 7px ${minuteTheme.glow}` : "none",
					}}
				/>
				{/* Scrubber dot (appears on hover) */}
				<div
					className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none"
					style={{
						left: `${progress * 100}%`,
						width: 9,
						height: 9,
						background: minuteTheme.wave[1],
						boxShadow: `0 0 8px ${minuteTheme.glow}`,
					}}
				/>
			</div>
		</div>
	);
};

export default AudioPlayer;
