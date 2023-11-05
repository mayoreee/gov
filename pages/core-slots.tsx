import { Governance } from '../features';
import { useCosmWasmClientContext } from '../contexts/CosmWasmClient';
import { CoinSupplyContextProvider } from '../contexts/CoinSupply';

const { CoreSlotProposals } = Governance;

const Funded = () => {
  const { cosmWasmClient } = useCosmWasmClientContext();

  return (
    <CoinSupplyContextProvider>
      {cosmWasmClient && (
        //@ts-ignore
        <CoreSlotProposals
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
