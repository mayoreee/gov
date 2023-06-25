import { useState, useEffect } from "react";
import { useChain } from "@cosmos-kit/react";
import {
  CosmWasmClient,
  SigningCosmWasmClient,
} from "@cosmjs/cosmwasm-stargate";
import { IdentityserviceQueryClient } from "../client/Identityservice.client";
import { useIdentityserviceGetIdentityByOwnerQuery } from "../client/Identityservice.react-query";
import { IDENTITY_SERVICE_CONTRACT, chainName } from "../config/defaults";

export const useClientIdentity = () => {
  const { address, getCosmWasmClient, getSigningCosmWasmClient } =
    useChain(chainName);

  const [cosmWasmClient, setCosmWasmClient] = useState<CosmWasmClient | null>(
    null
  );
  const [signingClient, setSigningClient] =
    useState<SigningCosmWasmClient | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const [walletAddress, setWalletAddress] = useState(address as string);
  const [identityName, setIdentityName] = useState<string | null>(null);

  const connectWalletClients = async () => {
    setLoading(true);
    try {
      const cosmClient = await getCosmWasmClient();
      const signingCosmClient = await getSigningCosmWasmClient();
      setCosmWasmClient(cosmClient);
      setSigningClient(signingCosmClient);
    } catch (error) {
      setError(error);
      console.log({ error });
    } finally {
      setLoading(false);
    }
  };

  const disconnect = () => {
    if (cosmWasmClient) {
      cosmWasmClient.disconnect();
    }
    setWalletAddress("");
    setCosmWasmClient(null);
    setSigningClient(null);
    setLoading(false);
  };

  const identityserviceClient = new IdentityserviceQueryClient(
    cosmWasmClient as CosmWasmClient,
    IDENTITY_SERVICE_CONTRACT
  );

  const identityOwnerQuery = useIdentityserviceGetIdentityByOwnerQuery({
    client: identityserviceClient,
    args: { owner: walletAddress },
    options: {
      refetchOnMount: true,
    },
  });

  useEffect(() => {
    if (identityOwnerQuery.data?.identity?.name) {
      setIdentityName(identityOwnerQuery.data.identity.name);
    }
  }, [identityOwnerQuery.data]);

  useEffect(() => {
    connectWalletClients();
  }, []);

  return {
    signingClient,
    cosmWasmClient,
    loading,
    error,
    walletAddress,
    disconnect,
    identityOwnerQuery,
    identityName,
  };
};
