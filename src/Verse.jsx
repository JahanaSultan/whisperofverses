import { ArrowRight, Check, Copy } from "lucide-react";
import { memo } from "react";
import { Link } from "react-router-dom";
import AudioPlayer from "./AudioPlayer";

const Verse = memo((props) => {
	const copyToClipboard = () => {
		const verse_az = document.querySelectorAll(".verse-az");
		const verse_ar = document.querySelectorAll(".verse-ar");
		const copy = document.querySelectorAll(".copy");
		copy.forEach((e) => (e.innerHTML = `<i class="ri-file-copy-line"></i>`));
		const copyText_az = verse_az[props.verse - 1];
		const copyText_ar = verse_ar[props.verse - 1];
		const verseText =
			copyText_ar.innerText +
			"\n\n" +
			copyText_az.innerText +
			" (" +
			copyText_az.dataset.chapter +
			" " +
			copyText_az.dataset.verse +
			")";
		navigator.clipboard.writeText(verseText);
		copy[props.verse - 1].innerHTML = <Check size={18} />;
	};

	return (
		<li
			id={`verse${props.verse}`}
			className="bg-[rgba(228,226,219,0.92)] rounded-lg border border-[rgba(153,88,59,0.18)] shadow-sm overflow-hidden transition-shadow duration-200 hover:shadow-md backdrop-blur-sm"
		>
			{/* Verse header */}
			<div className="flex w-full justify-between items-center bg-[#99583B] px-3 py-1.75">
				<span className="text-sm text-[#E4E2DB] font-semibold">
					{props.verse}.
				</span>
				{props.search ? null : (
					<span
						className="copy cursor-pointer flex items-center gap-1 px-2 py-0.75 rounded bg-[rgba(228,226,219,0.18)] transition-colors duration-200 hover:bg-[rgba(228,226,219,0.35)] text-[#E4E2DB] text-[13px]"
						onClick={copyToClipboard}
					>
						<Copy size={18} />
					</span>
				)}
			</div>

			{/* Verse body */}
			<div className="w-full">
				{/* Arabic text */}
				<div className="verse-ar text-[28px] w-full bg-[#013f4e] text-[#f5e6c8] text-right [direction:rtl] font-arabic leading-[2.6] px-5 py-4">
					{props.verse_ar ?? (
						<Link
							to={`/chapter/${props.chapter}`}
							className="text-[15px] text-[#E4E2DB] font-sans [direction:ltr] text-left flex items-center gap-1.5"
						>
							{props.chapter_name}{" "}
							<ArrowRight size={16} color={"var(--light)"} />
						</Link>
					)}
				</div>

				{/* Audio player */}
				{props.audio ? <AudioPlayer src={props.audio} /> : null}

				{/* Azerbaijani translation */}
				<div
					className="verse-az text-[#013f4e] text-sm leading-[1.85] border-t border-[rgba(201,191,183,0.5)] px-4 py-3"
					data-chapter={props.chapter}
					data-verse={props.verse}
				>
					{props.verse_az}
				</div>
			</div>
		</li>
	);
});

export default Verse;
