const todayKey = () => {
    const d = new Date();
    return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
};

export const getPrayerTimesByCity = async (cityName) => {
    const cacheKey = `praytime_${cityName}_${todayKey()}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) return JSON.parse(cached);

    const res = await fetch(
        `https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(cityName)}&country=AZ&method=13`,
    );
    const { data } = await res.json();
    const result = { timings: data.timings, hijri: data.date.hijri };
    localStorage.setItem(cacheKey, JSON.stringify(result));
    return result;
};
