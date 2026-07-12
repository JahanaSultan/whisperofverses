import { useQuery } from "@tanstack/react-query";
import { getQuranAz } from "../services/quranService";

export const useQuranAz = () =>
    useQuery({ queryKey: ["quranAz"], queryFn: getQuranAz, staleTime: Infinity });
