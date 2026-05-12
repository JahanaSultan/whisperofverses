import { useState, useRef, useEffect, useCallback } from "react";
import { Play, Pause } from "lucide-react";

const BAR_COUNT = 50;
const IDLE_BARS = Array(BAR_COUNT).fill(3);

const AudioPlayer = ({ src }) => {
	const audioRef = useRef(null);
	const analyserRef = useRef(null);
	const audioCtxRef = useRef(null);
	const rafRef = useRef(null);
	const useCssAnim = useRef(false);

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
			// Do NOT connect analyser→destination: audio already plays normally
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
			setupAudio();
			window.dispatchEvent(new CustomEvent("audio-play", { detail: src }));
			const ctx = audioCtxRef.current;
			const start = () => {
				audio.play();
				setIsPlaying(true);
				if (!useCssAnim.current) drawBars();
			};
			ctx ? ctx.resume().then(start) : start();
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
		<div className="flex items-center gap-2 px-3 py-2 bg-[#E4E2DB] border-t border-[#C9BFB7]">
			<audio
				ref={audioRef}
				src={src}
				onTimeUpdate={handleTimeUpdate}
				onLoadedMetadata={() => setDuration(audioRef.current.duration)}
				onEnded={handleEnded}
			/>

			<button
				onClick={togglePlay}
				className="shrink-0 w-7 h-7 rounded-full bg-[#99583B] text-[#E4E2DB] flex items-center justify-center hover:bg-[#013f4e] transition-colors duration-200"
			>
				{isPlaying ? <Pause size={13} color={"var(--light)"} /> : <Play size={13} color={"var(--light)"} />}
			</button>

			<div className="flex-1 flex items-end justify-between h-6 gap-px">
				{bars.map((height, i) =>
					useCssAnim.current ? (
						<div
							key={i}
							className="eq-bar flex-1 rounded-sm bg-[#99583B]"
							style={{
								animationPlayState: isPlaying ? "running" : "paused",
								animationDelay: `${CSS_DELAYS.current[i]}s`,
							}}
						/>
					) : (
						<div
							key={i}
							className="flex-1 rounded-sm bg-[#99583B]"
							style={{
								height: `${height}px`,
								transition: "height 60ms linear",
							}}
						/>
					),
				)}
			</div>

			<span className="shrink-0 text-[11px] text-[#013f4e] tabular-nums font-mono">
				{fmt(currentTime)}
				<span className="opacity-40 mx-0.5">/</span>
				{fmt(duration)}
			</span>
		</div>
	);
};

export default AudioPlayer;
