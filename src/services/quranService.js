const BASE = "https://cdn.jsdelivr.net/gh/JahanaSultan/quran@latest";

export const getChapterInfo = () =>
    fetch(`${BASE}/json/quran-chapter-info.json`).then((res) => res.json());

export const getQuranAz = () =>
    fetch(`${BASE}/json/quran-az.json`).then((res) => res.json());

export const getQuranAr = () =>
    fetch(`${BASE}/json/quran-ar.json`).then((res) => res.json());

export const getAlikhanmusayevEdition = () =>
    fetch("https://cdn.jsdelivr.net/gh/fawazahmed0/quran-api@1/editions/aze-alikhanmusayev.json")
        .then((res) => res.json());
