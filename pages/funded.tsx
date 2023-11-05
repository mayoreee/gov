import { Governance } from '../features';
import { useCosmWasmClientContext } from '../contexts/CosmWasmClient';
import { CoinSupplyContextProvider } from '../contexts/CoinSupply';

const { WinningGrantProposals } = Governance;

const Funded = () => {
  const { cosmWasmClient } = useCosmWasmClientContext();

  return (
    <CoinSupplyContextProvider>
      {cosmWasmClient && (
        //@ts-ignore
        <WinningGrantProposals
          cosmWasmClient={cosmWasmClient}
          setSelectedProposalId={() => {
            // router.push(`/proposals/${id}`);
          }}
        />
      )}
    </CoinSupplyContextProvider>
  );
};
export default Funded;
