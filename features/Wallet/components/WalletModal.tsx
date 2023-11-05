import { useChain } from '@jmesworld-cosmos-kit/react';
import { chainName } from '../../../config/defaults';

export const WalletModal = () => {
  const { closeView } = useChain(chainName);
  closeView();
  return <></>;
};
