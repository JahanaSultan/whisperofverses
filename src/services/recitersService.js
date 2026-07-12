export const getReciters = async ({ signal } = {}) => {
    const res = await fetch("https://everyayah.com/data/recitations.js", { signal });
    const raw = await res.json();
    return Object.entries(raw)
        .filter(([key]) => !isNaN(Number(key)))
        .map(([, val]) => ({
            subfolder: val.subfolder,
            name: val.name,
            bitrate: val.bitrate,
        }))
        .sort((a, b) => a.name.localeCompare(b.name));
};
