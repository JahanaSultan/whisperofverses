import { useQuery } from "@tanstack/react-query";
import { getPrayerTimesByCity } from "../services/prayerService";

const todayKey = () => {
    const d = new Date();
    return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
};

export const usePrayerTimes = (cityName) =>
    useQuery({
        queryKey: ["prayerTimes", cityName, todayKey()],
        queryFn: () => getPrayerTimesByCity(cityName),
        enabled: !!cityName,
        staleTime: Infinity,
    });
