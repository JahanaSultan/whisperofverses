import { Settings2, Type, Music2, RotateCcw } from "lucide-react";
import { useSettings } from "./SettingsContext";

const ARABIC_PREVIEW = "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ";
const AZ_PREVIEW = "Mərhəmətli, rəhmli Allahın adı ilə.";

const Slider = ({ label, value, min, max, onChange, unit = "px" }) => (
	<div className="flex flex-col gap-2">
		<div className="flex justify-between items-center">
			<span className="text-[13px] font-semibold text-[#013f4e]">{label}</span>
			<span className="text-[12px] font-mono bg-[#013f4e] text-[#E4E2DB] px-2 py-0.5 rounded-full">
				{value}
				{unit}
			</span>
		</div>
		<input
			type="range"
			min={min}
			max={max}
			value={value}
			onChange={(e) => onChange(Number(e.target.value))}
			className="settings-slider w-full h-1.5 rounded-full appearance-none cursor-pointer"
			style={{
				background: `linear-gradient(to right, #99583B ${((value - min) / (max - min)) * 100}%, #C9BFB7 ${((value - min) / (max - min)) * 100}%)`,
			}}
		/>
		<div className="flex justify-between text-[10px] text-[#99583B] opacity-70">
			<span>
				{min}
				{unit}
			</span>
			<span>
				{max}
				{unit}
			</span>
		</div>
	</div>
);

const Toggle = ({ checked, onChange }) => (
	<button
		type="button"
		onClick={() => onChange(!checked)}
		className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
		style={{ backgroundColor: checked ? "#99583B" : "#C9BFB7" }}
		aria-checked={checked}
		role="switch"
	>
		<span
			className="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out"
			style={{ transform: checked ? "translateX(20px)" : "translateX(0)" }}
		/>
	</button>
);

const Settings = () => {
	const { settings, update } = useSettings();

	const reset = () => {
		update("arabicSize", 28);
		update("azSize", 14);
		update("autoPlayNext", false);
	};

	return (
		<main className="pb-8">
			{/* Page header */}
			<div className="flex items-center justify-between mb-6">
				<h1 className="flex items-center gap-2.5 text-[#E4E2DB] text-[22px] font-bold">
					<Settings2 size={22} color="#B39375" />
					Parametrlər
				</h1>
				<button
					type="button"
					onClick={reset}
					className="flex items-center gap-1.5 text-[12px] text-[#B39375] hover:text-[#E4E2DB] transition-colors duration-200 px-3 py-1.5 rounded-lg border border-[rgba(179,147,117,0.35)] hover:border-[rgba(228,226,219,0.5)]"
				>
					<RotateCcw size={13} />
					Sıfırla
				</button>
			</div>

			<div className="flex flex-col gap-4">
				{/* Text sizes card */}
				<div className="bg-[rgba(228,226,219,0.92)] rounded-lg border border-[rgba(153,88,59,0.18)] shadow-sm overflow-hidden backdrop-blur-sm">
					<div className="flex items-center gap-2 bg-[#99583B] px-4 py-2.5">
						<Type size={18} color="#E4E2DB" />
						<h2 className="text-[#E4E2DB] font-semibold">Mətn Ölçüləri</h2>
					</div>

					<div className="p-5 flex flex-col gap-6">
						{/* Arabic size */}
						<div className="flex flex-col gap-3">
							<Slider
								label="Ərəb mətn ölçüsü"
								value={settings.arabicSize}
								min={20}
								max={50}
								onChange={(v) => update("arabicSize", v)}
							/>
							<div
								className="w-full bg-[#013f4e] text-[#f5e6c8] text-right [direction:rtl] font-arabic leading-[2.4] px-5 py-3 rounded-md"
								style={{ fontSize: settings.arabicSize + "px" }}
							>
								{ARABIC_PREVIEW}
							</div>
						</div>

						<div className="border-t border-[rgba(201,191,183,0.5)]" />

						{/* Azerbaijani size */}
						<div className="flex flex-col gap-3">
							<Slider
								label="Azərbaycan mətn ölçüsü"
								value={settings.azSize}
								min={12}
								max={50}
								onChange={(v) => update("azSize", v)}
							/>
							<div
								className="w-full bg-[rgba(1,63,78,0.06)] text-[#013f4e] leading-[1.85] px-4 py-3 rounded-md border border-[rgba(201,191,183,0.4)]"
								style={{ fontSize: settings.azSize + "px" }}
							>
								{AZ_PREVIEW}
							</div>
						</div>
					</div>
				</div>

				{/* Audio card */}
				<div className="bg-[rgba(228,226,219,0.92)] rounded-lg border border-[rgba(153,88,59,0.18)] shadow-sm overflow-hidden backdrop-blur-sm">
					<div className="flex items-center gap-2 bg-[#99583B] px-4 py-2.5">
						<Music2 size={18} color="#E4E2DB" />
						<h2 className="text-[#E4E2DB] text-[14px] font-semibold">Audio</h2>
					</div>

					<div className="p-5">
						<div className="flex items-start justify-between gap-4">
							<div className="flex flex-col gap-1">
								<span className="text-[13px] font-semibold text-[#013f4e]">
									Avtomatik növbəti ayə
								</span>
								<p className="text-[12px] text-[#6b8a95] leading-[1.6]">
									Ayə bitdikdə növbəti ayəni avtomatik olaraq oxusun
								</p>
							</div>
							<Toggle
								checked={settings.autoPlayNext}
								onChange={(v) => update("autoPlayNext", v)}
							/>
						</div>
					</div>
				</div>
			</div>
		</main>
	);
};

export default Settings;
