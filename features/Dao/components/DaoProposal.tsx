/* eslint-disable @typescript-eslint/ban-types */
import { Box, Button, Flex, Image, Text, Tooltip } from '@chakra-ui/react';
import { useRef } from 'react';
import { CosmWasmClient } from '@cosmjs/cosmwasm-stargate';
import DaoMembersList from '../DaoMemberList';

import { DaoMultisigQueryClient } from '../../../client/DaoMultisig.client';
import { useDaoMultisigListProposalsQuery } from '../../../client/DaoMultisig.react-query';

import {
  ProposalHeader,
  ProposalList,
} from '../../components/Proposal/ProposalList';
import { useCosmWasmClientContext } from '../../../contexts/CosmWasmClient';

import { BalanceDisplay } from './Balance';
import { useCoinSupplyContext } from '../../../contexts/CoinSupply';
import { useEffect, useMemo } from 'react';
import { GovernanceQueryClient } from '../../../client/Governance.client';
import { NEXT_PUBLIC_GOVERNANCE_CONTRACT } from '../../../config/defaults';
import { useClipboardTimeout } from '../../../hooks/useClipboard';
import { isProposalGov } from '../../../utils/proposalUti';
import { ProposalResponseForEmpty } from '../../../client/DaoMultisig.types';
import { useDAOContext } from '../../../contexts/DAOContext';
import Link from 'next/link';
import { AddIcon } from '@chakra-ui/icons';

export default function DaoProposal({
  daoAddress,
  daoName,
  setDaoProposalDetailOpen,
  setSelectedDaoProposalTitle,
  setSelectedDaoMembersList,
  setSelectedProposalId,
}: {
  daoAddress: string;
  daoName: string;
  // TODO: update ts types
  setDaoProposalDetailOpen: Function;
  setSelectedDaoProposalTitle: Function;
  setSelectedDaoMembersList: Function;
  setSelectedProposalId: Function;
}) {
  const { setSelectedDAOByAddress } = useDAOContext();
  const tooltipRef = useRef(null);
  useEffect(() => {
    setSelectedDAOByAddress(daoAddress);
  }, [daoAddress, setSelectedDAOByAddress]);

  const { cosmWasmClient } = useCosmWasmClientContext();
  const { supply } = useCoinSupplyContext();
  const [copied, copyToClipboard] = useClipboardTimeout();
  const daoQueryClient = useMemo(
    () =>
      new DaoMultisigQueryClient(
        cosmWasmClient as CosmWasmClient,
        daoAddress as string,
      ),
    [cosmWasmClient, daoAddress],
  );
  const goverrnanceQueryClient = useMemo(
    () =>
      new GovernanceQueryClient(
        cosmWasmClient as CosmWasmClient,
        NEXT_PUBLIC_GOVERNANCE_CONTRACT,
      ),
    [cosmWasmClient],
  );

  const { data, isFetching, isLoading } = useDaoMultisigListProposalsQuery({
    client: daoQueryClient,
    args: { limit: 10000 },
    options: {
      queryKey: ['daoDetail', daoAddress],
      refetchInterval: 10000,
    },
  });

  const proposals = useMemo(() => {
    const gov: ProposalResponseForEmpty[] = [];
    const daoPropsal: ProposalResponseForEmpty[] = [];
    if (!data) {
      return {
        gov,
        daoPropsal,
      };
    }
    data.proposals.forEach(proposal => {
      const isGovProposal = isProposalGov(proposal, goverrnanceQueryClient);
      if (isGovProposal) {
        gov.push(proposal);
        return;
      }

      daoPropsal.push(proposal);
    });
    return {
      gov,
      daoPropsal,
    };
  }, [data, goverrnanceQueryClient]);

  return (
    <Box pb="4">
      <Flex height={'47px'} />
      <Flex
        style={{
          width: 'calc( 100% - 306px )',
        }}
      >
        <Flex flexDir="column" w="full">
          <Text
            color={'darkPurple'}
            fontWeight="bold"
            fontSize={28}
            mb="3"
            fontFamily="DM Sans"
          >
            {daoName}
          </Text>
          <Flex w="full" alignItems="center" justifyContent="space-between">
            <Flex
              mt="2"
              py={2}
              alignItems="center"
              bg="white"
              borderRadius={22}
              border={1}
              borderStyle="solid"
              borderColor="primary.100"
              px="4"
            >
              <Text mr="2" color="purple">
                {daoAddress.slice(0, 20)}...{daoAddress.slice(-6)}
              </Text>

              <Tooltip
                ref={tooltipRef}
                // show tooltip after copy
                isOpen={copied || undefined}
                hasArrow
                label={copied ? '✅ Copied Address' : 'Copy DAO address'}
                placement="top"
              >
                <Image
                  mr="4"
                  cursor="pointer"
                  display="inline-block"
                  src="/copy.svg"
                  width="18px"
                  height="18px"
                  marginLeft="2px"
                  alt="Dao Address"
                  onClick={() => {
                    copyToClipboard(daoAddress);
                  }}
                />
              </Tooltip>
              <BalanceDisplay asCard={false} address={daoAddress} />
            </Flex>
            <Flex flexDir="row" flexWrap="wrap" gap="2">
              <Link href="/dao/proposals">
                <Button
                  rounded="full"
                  bg="purple"
                  color="white"
                  fontWeight="normal"
                  py="13px"
                  // TODO: move to theme config
                  _hover={{
                    bg: 'purple',
                  }}
                  variant="solid"
                  borderColor="darKPurple"
                >
                  <AddIcon boxSize={'10px'} mr="2" color="brand" />
                  DAO Proposal
                </Button>
              </Link>
              <Link href="/proposals/create">
                <Button
                  rounded="full"
                  bg="purple"
                  color="white"
                  fontWeight="normal"
                  py="13px"
                  _hover={{
                    bg: 'purple',
                  }}
                  variant="solid"
                  borderColor="darkPurple"
                >
                  <AddIcon boxSize={'10px'} mr="2" color="brand" />
                  GOV Proposal
                </Button>
              </Link>
            </Flex>
          </Flex>
        </Flex>
      </Flex>
      <Flex>
        <Box flexGrow={1}>
          <Flex height={'20px'} />

          {proposals?.gov?.length > 0 && (
            <Flex flexDir="column" mb="25px">
              <ProposalHeader
                proposalTitle=" GOVERNANCE PROPOSAL/S"
                isGov={true}
              />
              <Flex height={'9px'} />
              <ProposalList
                daoClient={daoQueryClient}
                client={goverrnanceQueryClient}
                daoName={daoName}
                totalSupply={supply as number}
                proposals={proposals.gov}
                isGov={false}
                goToDaoDetail
                isGovList={true}
                daoAddress={daoAddress}
                onClickListItem={() => {
                  setDaoProposalDetailOpen(true);
                }}
                setSelectedDaoProposalTitle={setSelectedDaoProposalTitle}
                setSelectedProposalId={setSelectedProposalId}
              />
            </Flex>
          )}

          {proposals?.daoPropsal?.length > 0 && (
            <Flex flexDir="column" mb="25px">
              <ProposalHeader proposalTitle=" DAO PROPOSAL/S" isGov={false} />
              <Flex height={'9px'} />
              <ProposalList
                daoClient={daoQueryClient}
                client={goverrnanceQueryClient}
                daoName={daoName}
                totalSupply={supply as number}
                proposals={proposals.daoPropsal}
                isGov={false}
                isGovList={false}
                daoAddress={daoAddress}
                onClickListItem={() => {
                  setDaoProposalDetailOpen(true);
                }}
                setSelectedDaoProposalTitle={setSelectedDaoProposalTitle}
                setSelectedProposalId={setSelectedProposalId}
              />
            </Flex>
          )}

          {isLoading ||
            (isFetching && !data && (
              <Flex justifyContent="center" width="100%">
                <Text
                  color="rgba(15,0,86,0.8)"
                  fontFamily={'DM Sans'}
                  fontWeight="normal"
                  fontStyle={'italic'}
                  fontSize={14}
                  marginTop={'24px'}
                >
                  Loading DAO proposals...
                </Text>
              </Flex>
            ))}
        </Box>
        <DaoMembersList
          daoQueryClient={daoQueryClient}
          setSelectedDaoMembersList={setSelectedDaoMembersList}
        />
      </Flex>
    </Box>
  );
}
