import { useQuery } from "@tanstack/react-query";
import { getReciters } from "../services/recitersService";

export const useReciters = () =>
    useQuery({
        queryKey: ["reciters"],
        queryFn: ({ signal }) => getReciters({ signal }),
        staleTime: Infinity,
    });
