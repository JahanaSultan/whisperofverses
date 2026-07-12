import { useQuery } from "@tanstack/react-query";
import { getQuranAr } from "../services/quranService";

export const useQuranAr = () =>
    useQuery({ queryKey: ["quranAr"], queryFn: getQuranAr, staleTime: Infinity });
