import {
  Box,
  Center,
  CircularProgress,
  Flex,
  HStack,
  Spacer,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useChain } from "@cosmos-kit/react";
import { chainName } from "../config/defaults";
import { ProposalHeader } from "../components/react/proposal/proposal-header";
import { ProposalVoting } from "../components/react/proposal/proposal-voting";
import { ProposalMyVote } from "../components/react/proposal/proposal-my-vote";
import { ProposalDaoMembers } from "../components/react/proposal/proposal-dao-members";
import {
  CosmWasmClient,
  SigningCosmWasmClient,
} from "@cosmjs/cosmwasm-stargate";
import {
  useDaoMultisigListVotersQuery,
  useDaoMultisigListVotesQuery,
  useDaoMultisigProposalQuery,
} from "../client/DaoMultisig.react-query";
import { DaoMultisigQueryClient } from "../client/DaoMultisig.client";
import { IdentityserviceQueryClient } from "../client/Identityservice.client";
import { useIdentityserviceGetIdentityByOwnerQuery } from "../client/Identityservice.react-query";
import PeriodInfo from "../components/react/period-info";
import { ConnectWalletSection } from "../components/react/connect-wallet-section";

const IDENTITY_SERVICE_CONTRACT = process.env
  .NEXT_PUBLIC_IDENTITY_SERVICE_CONTRACT as string;

export default function DaoProposalDetail({
  selectedDao,
  selectedDaoName,
  selectedDaoProposalTitle,
  selectedDaoMembersList,
  selectedDaoProposalId,
  identityName,
  identityBalance,
  isConnectButtonClicked,
  setConnectButtonClicked,
}: {
  selectedDao: string;
  selectedDaoName: string;
  selectedDaoProposalTitle: string;
  selectedDaoMembersList: Array<any>;
  selectedDaoProposalId: number;
  identityName: string;
  identityBalance: string;
  isConnectButtonClicked: boolean;
  setConnectButtonClicked: Function;
}) {
  const { address, status, getCosmWasmClient, getSigningCosmWasmClient } =
    useChain(chainName);

  const [cosmWasmClient, setCosmWasmClient] = useState<CosmWasmClient | null>(
    null
  );
  const [signingClient, setSigningClient] =
    useState<SigningCosmWasmClient | null>(null);
  useEffect(() => {
    if (address) {
      getCosmWasmClient()
        .then((cosmWasmClient) => {
          if (!cosmWasmClient) {
            return;
          }
          setCosmWasmClient(cosmWasmClient);
        })
        .catch((error) => console.log(error));

      getSigningCosmWasmClient()
        .then((signingClient) => {
          if (!signingClient) {
            return;
          }
          setSigningClient(signingClient);
        })
        .catch((error) => console.log(error));
    }
  }, [address, getCosmWasmClient]);

  const daoMultisigQueryClient = new DaoMultisigQueryClient(
    cosmWasmClient as CosmWasmClient,
    selectedDao as string
  );

  const proposalDetailQuery = useDaoMultisigProposalQuery({
    client: daoMultisigQueryClient,
    args: {
      proposalId: selectedDaoProposalId,
    },
    options: {
      refetchInterval: 10,
    },
  });

  const votesQuery = useDaoMultisigListVotesQuery({
    client: daoMultisigQueryClient,
    args: { proposalId: selectedDaoProposalId },
    options: { refetchInterval: 10 },
  });

  const votersQuery = useDaoMultisigListVotersQuery({
    client: daoMultisigQueryClient,
    args: {},
    options: { refetchInterval: 10 },
  });

  const proposalDescription = proposalDetailQuery?.data?.description ?? "";
  // @ts-ignore
  const expiryDate = proposalDetailQuery?.data?.expires?.at_height ?? 0;
  const averageBlockTime = 5; // Average block time in seconds
  const genesisTimestamp = 1684768989000; // Genesis timestamp
  const expiryDateTimestamp = !!proposalDetailQuery?.data
    ? genesisTimestamp + expiryDate * averageBlockTime * 1000
    : -1;

  const yesCount = !!votesQuery.data
    ? (votesQuery.data?.votes.filter(
        (vote) =>
          vote.proposal_id === selectedDaoProposalId && vote.vote === "yes"
      )?.length as number)
    : 0;

  const totalCount = !!votersQuery.data ? votersQuery.data?.voters?.length : 0;

  const yesPercentage = Math.floor(
    (yesCount !== 0 ? yesCount / totalCount : 0) * 100
  );

  const threshold =
    // @ts-ignore
    proposalDetailQuery?.data?.threshold?.absolute_percentage?.percentage;
  const target = !!proposalDetailQuery?.data ? parseFloat(threshold) : 0;

  const votes = votesQuery?.data?.votes ?? [];

  const myVotingInfo = votersQuery?.data?.voters.filter(
    (voter) => voter.addr === (address as string)
  ) ?? [{ weight: 0 }];
  const myVotingPower = myVotingInfo[0]?.weight;

  const passed = proposalDetailQuery?.data?.status === "passed";
  const myVotes =
    votesQuery?.data?.votes.filter(
      (vote) => vote.voter === (address as string)
    ) ?? [];

  return (
    <Box
      width={"100%"}
      height={"100%"}
      backgroundColor={"rgba(198, 180, 252, 0.3)"}
      padding="25px 54px"
      overflowY="scroll"
      flexGrow={"1"}
    >
      <Flex width={"100%"}>
        <PeriodInfo />
        <Spacer />
        <ConnectWalletSection
          identityName={identityName}
          identityBalance={identityBalance}
          isConnectButtonClicked={isConnectButtonClicked}
          setConnectButtonClicked={setConnectButtonClicked}
        />
      </Flex>
      <Flex height={"47px"} />
      <ProposalHeader
        daoName={selectedDaoName}
        proposalTitle={selectedDaoProposalTitle}
        proposalExpiry={expiryDateTimestamp}
      />
      {!!proposalDetailQuery.data ? (
        <HStack spacing="54px" align="flex-start">
          <Box flexGrow={1}>
            <ProposalVoting
              yesPercentage={yesPercentage}
              target={target * 100}
              votes={votes}
            />
            <Box
              background="rgba(112, 79, 247, 0.1)"
              borderRadius="12px"
              border="1px solid rgba(112, 79, 247, 0.5)"
              padding="14px 16px"
              marginTop="20px"
              height="300px"
            >
              <Text
                fontSize="16px"
                fontWeight="normal"
                color="rgba(81, 54, 194, 1)"
                fontFamily="DM Sans"
              >
                {proposalDescription}
              </Text>
            </Box>
          </Box>
          <VStack width="330px" spacing="30px" align="flex-start">
            <ProposalMyVote
              myVotingPower={myVotingPower}
              passed={passed}
              voted={myVotes.length > 0}
              dao={selectedDao}
              proposalId={selectedDaoProposalId}
            />
            {/* <ProposalDaoMembers
              selectedDaoMembersList={daoMembers}
            /> */}
          </VStack>
        </HStack>
      ) : (
        <Center marginTop={"80px"}>
          <CircularProgress isIndeterminate color="darkPurple" />
        </Center>
      )}
    </Box>
  );
}
