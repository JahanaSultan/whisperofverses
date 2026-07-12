import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAlikhanmusayevEdition } from "../services/quranService";

export const useRandomVerse = () => {
    const { data } = useQuery({
        queryKey: ["edition", "aze-alikhanmusayev"],
        queryFn: getAlikhanmusayevEdition,
        staleTime: Infinity,
    });

    return useMemo(() => {
        if (!data) return null;
        return data.quran[Math.floor(Math.random() * data.quran.length)];
    }, [data]);
};
