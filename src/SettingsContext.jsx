import { createContext, useContext, useState } from "react";

const STORAGE_KEY = "wov_settings";

const defaults = {
	arabicSize: 28,
	arabicFont: "Scheherazade New",
	azSize: 14,
	autoPlayNext: false,
	reciterSubfolder: "",
	reciterName: "",
};

const load = () => {
	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		return stored ? { ...defaults, ...JSON.parse(stored) } : { ...defaults };
	} catch {
		return { ...defaults };
	}
};

const SettingsContext = createContext(null);

export const SettingsProvider = ({ children }) => {
	const [settings, setSettings] = useState(load);

	const update = (key, value) => {
		setSettings((prev) => {
			const next = { ...prev, [key]: value };
			localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
			return next;
		});
	};

	return (
		<SettingsContext.Provider value={{ settings, update }}>
			{children}
		</SettingsContext.Provider>
	);
};

export const useSettings = () => useContext(SettingsContext);
