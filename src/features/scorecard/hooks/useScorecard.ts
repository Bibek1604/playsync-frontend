import { useQuery } from '@tanstack/react-query';
import { scorecardService, Scorecard } from '../api/scorecard-service';

export const useScorecard = () => {
    const {
        data: scorecard,
        isLoading,
        error
    } = useQuery({
        queryKey: ['scorecard'],
        queryFn: scorecardService.getMyScorecard
    });

    return {
        scorecard,
        isLoading,
        error
    };
};
