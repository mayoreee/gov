import { GovernanceQueryClient } from '../../client/Governance.client';
import { useEffect, useMemo, useState } from 'react';
import { usePagination } from '../Delegate/hooks/usePagination';
import {
  useGovernanceCoreSlotsQuery,
  useGovernanceProposalsQuery,
  useGovernanceWinningGrantsQuery,
} from '../../client/Governance.react-query';
import {
  ProposalQueryStatus,
  ProposalsResponse,
} from '../../client/Governance.types';
import { useQueries } from '@tanstack/react-query';
import { assertNullOrUndefined } from '../../utils/ts';

type GovernanceProps = {
  governanceQueryClient: GovernanceQueryClient;
};

type LoadAll = 'load-all';
export const useGovernanceProposals = ({
  governanceQueryClient,
  status,
  loadAll,
  reverse = true,
}: GovernanceProps & {
  status: ProposalQueryStatus;
  loadAll?: LoadAll;
  reverse?: boolean;
}): {
  data: ProposalsResponse | undefined;
  isLoading: boolean;
  isFetched: boolean;
  isFetching: boolean;
  pagination?: {
    limit: number;
    offset: number;
    page: number;
    setPage: (page: number) => void;
    total: number;
  };
} => {
  const { setTotal, total, limit, offset, page, setPage } = usePagination({
    reverse,
    defaultLimit: 10,
  });
  const [proposalsData, setProposalData] = useState<
    ProposalsResponse['proposals']
  >([]);

  const startBefore = useMemo(() => {
    if (page === null) {
      return 0;
    }
    if (page && offset >= limit) {
      return offset;
    }
    if (offset <= 10 && offset !== 0) {
      return undefined;
    }
    return offset;
  }, [limit, offset, page]);

  const { data, isLoading, isFetching, isFetched } =
    useGovernanceProposalsQuery({
      client: governanceQueryClient,
      args: {
        status: status,
        limit,
        startBefore,
      },
      options: {
        enabled: !!status,
        refetchInterval: 5000,
      },
    });

  const lastFetch = useMemo(() => {
    return page && (startBefore == 0 || startBefore === undefined);
  }, [page, startBefore]);

  useEffect(() => {
    if (!data) {
      return;
    }
    if (data.proposal_count && total !== data.proposal_count) {
      setTotal(data?.proposal_count);
      setPage(1);
      return;
    }
    if (loadAll === 'load-all') {
      // offset 0 is the initial load to set the total.
      if (reverse && lastFetch) {
        setProposalData(p => [...data.proposals, ...p]);
        return;
      }
      if (total) {
        setProposalData(p => [...data.proposals, ...p]);
        setPage(p => (p ?? 0) + 1);
      }
    }
  }, [
    data,
    lastFetch,
    limit,
    loadAll,
    offset,
    page,
    reverse,
    setPage,
    setTotal,
    total,
  ]);

  const uniqueProposals = useMemo(() => {
    if (!proposalsData) return [];
    const proposalUniqueMap = new Map<
      number,
      ProposalsResponse['proposals'][0]
    >();
    proposalsData.forEach(proposal => {
      if (!proposalUniqueMap.has(proposal.id)) {
        proposalUniqueMap.set(proposal.id, proposal);
      }
    });
    return Array.from(proposalUniqueMap.values());
  }, [proposalsData]);

  return {
    data:
      loadAll === 'load-all'
        ? ({
            proposals: uniqueProposals,
            proposal_count: total,
          } as ProposalsResponse)
        : data,
    isLoading,
    isFetching,
    isFetched,
    pagination: {
      limit,
      offset,
      page: page ?? 0,
      setPage,
      total: total ?? 0,
    },
  };
};

export const useGovernanceWinningGrants = ({
  governanceQueryClient,
}: GovernanceProps): {
  data: ProposalsResponse | undefined;
  isLoading: boolean;
  isFetching: boolean;
  isFetched: boolean;
  error: Error | null;
} => {
  const {
    isFetched: isFetchedWinningGrants,
    data,
    isLoading: loadingWinningGrants,
    isFetching: fetchingWinningGrants,
    error: winningGrantsError,
  } = useGovernanceWinningGrantsQuery({
    client: governanceQueryClient,
    options: {
      refetchInterval: 10000,
    },
  });
  const result = useQueries({
    queries: (data?.winning_grants || []).map(grant => ({
      queryKey: ['funded', 'proposal', grant.proposal_id],
      queryFn: () => governanceQueryClient.proposal({ id: grant.proposal_id }),
      enabled: !!grant.proposal_id,
    })),
  });
  const isLoading =
    result.some(query => query.isLoading) || loadingWinningGrants;
  const isFetching =
    result.some(query => query.isFetching) || fetchingWinningGrants;

  const isFetched =
    isFetchedWinningGrants && result.every(query => query.isFetched);
  const error =
    winningGrantsError ||
    result
      .map(query => query.error as Error | null)
      .filter(assertNullOrUndefined)?.[0];

  const governanceData = result
    .map(query => query.data)
    .filter(assertNullOrUndefined);

  return {
    data: {
      proposal_count: governanceData.length,
      proposals: governanceData,
    },
    isLoading,
    isFetching,
    isFetched,
    error,
  };
};

export const useCoreSlotProposals = ({
  governanceQueryClient,
}: GovernanceProps) => {
  const {
    error: coreSlotError,
    data,
    isLoading: loadingCoreSlot,
    isFetching: fetchingCoreSlot,
    refetch: refetchCoreSlot,
    isFetched: isFetchedCoreSlot,
  } = useGovernanceCoreSlotsQuery({
    client: governanceQueryClient,

    options: {
      refetchInterval: 10000,
    },
  });
  const listOfCoreSlotProposals = useMemo(() => {
    const result: (number | undefined)[] = [];
    if (!data) return [];
    if ('brand' in data) {
      result.push(data.brand?.proposal_id as number | undefined);
    }
    if ('creative' in data) {
      result.push(data.creative?.proposal_id as number | undefined);
    }

    if ('core_tech' in data) {
      result.push(data.core_tech?.proposal_id as number | undefined);
    }
    return result.filter(assertNullOrUndefined);
  }, [data]);
  const result = useQueries({
    queries: listOfCoreSlotProposals.map(proposal => ({
      queryKey: ['core_slot', 'proposal', proposal],
      queryFn: async () => {
        try {
          return await governanceQueryClient.proposal({ id: proposal });
        } catch (e) {
          console.error('e', e);
          return null;
        }
      },
      enabled: proposal !== undefined,
    })),
  });
  const isLoading = result.some(query => query.isLoading) || loadingCoreSlot;
  const isFetching = result.some(query => query.isFetching) || fetchingCoreSlot;

  const governanceData = result
    .map(query => query.data)
    .filter(assertNullOrUndefined);

  const refetch = async () => {
    await refetchCoreSlot();
    await Promise.all(
      listOfCoreSlotProposals.map(proposal =>
        governanceQueryClient.proposal({ id: proposal }),
      ),
    );
  };

  const isFetched =
    isFetchedCoreSlot && result.every(query => query.error || query.isFetched);
  const error =
    coreSlotError ||
    result
      .map(query => query.error as Error | null)
      .filter(assertNullOrUndefined);
  return {
    data: {
      proposal_count: governanceData.length,
      proposals: governanceData,
    },
    isLoading: isLoading || isFetching,
    refetch,
    error,
    isFetched,
  };
};
