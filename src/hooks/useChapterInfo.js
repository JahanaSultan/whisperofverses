import { useQuery } from "@tanstack/react-query";
import { getChapterInfo } from "../services/quranService";

export const useChapterInfo = () =>
    useQuery({ queryKey: ["chapterInfo"], queryFn: getChapterInfo, staleTime: Infinity });
