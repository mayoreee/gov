import { Client } from 'jmes';
import { useCallback, useMemo, useState } from 'react';
import { useValidators } from './useValidators';
import { movingValidator } from '../lib/validateBonding';
import { useToast } from '@chakra-ui/react';
import { useIdentityContext } from '../../../contexts/IdentityContext';
import { BJMES_DENOM, JMES_DENOM } from '../../../lib/constants';
import { useBalanceContext } from '../../../contexts/balanceContext';
import { useSigningCosmWasmClientContext } from '../../../contexts/SigningCosmWasmClient';
import { coin } from '@cosmjs/amino';

const LCD_URL = process.env.NEXT_PUBLIC_REST_URL as string;
const NEXT_PUBLIC_CHAIN_ID = process.env.NEXT_PUBLIC_CHAIN_ID as string;

const client = new Client({
  providers: { LCDC: { chainID: NEXT_PUBLIC_CHAIN_ID, URL: LCD_URL } },
});

type TransferFormType = {
  jmesValue: number;
  bJmesValue: number;
  sliderValue: number;
};

type BoundingState = {
  bonding: boolean;
  delegatingToken?: boolean;
  selectedValidator: string | null;
  selectedUnBonding: string | null;
};

const sliderDefaultValue = 0;
export const useDelegate = () => {
  const { signingCosmWasmClient } = useSigningCosmWasmClientContext();
  const { balance } = useBalanceContext();
  const totalJmes = useMemo(
    () => Number(balance?.unstaked.toFixed(0) ?? 0),
    [balance?.unstaked],
  );
  const totalBondedJmes = useMemo(
    () => Number(balance?.staked.toFixed(0) ?? 0),
    [balance?.staked],
  );

  const { address } = useIdentityContext();

  const {
    isValidatorsLoading,
    validatorsError,
    bondedValidatorsError,
    validatorList,
    isBondedValidatorsLoading,
    bondedValidators,
    unBondingsData,
    unBondingsError,
    isLoadingUnBondings,
  } = useValidators(client);
  const toast = useToast();

  const [transferForm, setTransferForm] = useState<TransferFormType>({
    jmesValue: Number(totalJmes.toFixed(0)),
    bJmesValue: Number(totalBondedJmes.toFixed(0)),
    sliderValue: sliderDefaultValue,
  });
  const { jmesValue, bJmesValue } = transferForm;

  const [bondingState, setBondingState] = useState<BoundingState>({
    bonding: true,
    delegatingToken: undefined,
    selectedValidator: null,
    selectedUnBonding: null,
  });
  const { bonding, selectedValidator, selectedUnBonding } = bondingState;

  const toggleBonding = () => {
    setBondingState(p => ({
      ...p,
      bonding: !p.bonding,
    }));
  };

  const onChangeSlider = (sliderValue: number) => {
    setTransferForm(p => {
      const jmesValue = bonding
        ? (totalJmes / 100) * (100 - sliderValue)
        : totalJmes + (totalBondedJmes / 100) * sliderValue;
      const bJmesValue = bonding
        ? (totalJmes / 100) * sliderValue + totalBondedJmes
        : (totalBondedJmes / 100) * (100 - sliderValue);
      return {
        ...p,
        jmesValue: Number(jmesValue.toFixed(0)),
        bJmesValue: Number(bJmesValue.toFixed(0)),
        sliderValue,
      };
    });
  };

  const valueToMove = useMemo(() => {
    return bonding ? bJmesValue - totalBondedJmes : jmesValue - totalBondedJmes;
  }, [bonding, totalBondedJmes, bJmesValue, jmesValue]);

  const bondingIsValid = useMemo(() => {
    return jmesValue > 0 && totalJmes > 0;
  }, [totalJmes, jmesValue]);

  const isMovingNotValid = useMemo(() => {
    return movingValidator({
      total: bonding ? totalJmes : totalBondedJmes,
      current: bonding ? jmesValue : bJmesValue,
      transfer: valueToMove,
    });
  }, [bonding, totalBondedJmes, totalJmes, bJmesValue, jmesValue, valueToMove]);

  const delegateTokens = useCallback(async () => {
    if (isMovingNotValid || !bondingIsValid || !address) {
      toast({
        title: `Can't ${bonding ? 'delegate' : 'undelegate'
          }, please fix the issues!`,
        duration: 4000,
      });
      return;
    }
    setBondingState(p => ({
      ...p,
      delegatingToken: true,
    }));
    try {
      if (bonding) {
        if (!selectedValidator) {
          return;
        }
        await signingCosmWasmClient?.delegateTokens(
          address,
          selectedValidator,
          coin(valueToMove * 1e6, JMES_DENOM),
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          /// @ts-ignore ( Issue with different type)
          'auto',
        );

        toast({
          title: 'Delegated Token ',
        });
      } else {
        if (!selectedUnBonding) {
          return;
        }
        await signingCosmWasmClient?.undelegateTokens(
          address,
          selectedUnBonding,
          coin(valueToMove * 1e6, BJMES_DENOM),
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          /// @ts-ignore ( Issue with different type)
          'auto',
        );
        toast({
          title: 'Delegated Token ',
        });
      }
    } catch (err) {
      if (err instanceof Error)
        toast({
          status: 'error',
          title: err.message,
        });
    }

    setBondingState(p => ({
      ...p,
      delegatingToken: false,
    }));
  }, [
    isMovingNotValid,
    bondingIsValid,
    address,
    toast,
    bonding,
    selectedValidator,
    signingCosmWasmClient,
    valueToMove,
    selectedUnBonding,
  ]);

  return {
    ...transferForm,
    ...bondingState,
    setBondingState,
    bondingIsValid,
    setTransferForm,
    isValidatorsLoading,
    validatorList,
    toggleBonding,
    onChangeSlider,
    valueToMove,
    isMovingNotValid,
    delegateTokens,
    bondedValidators,
    isBondedValidatorsLoading,
    validatorsError,
    bondedValidatorsError,
    unBondingsData,
    unBondingsError,
    isLoadingUnBondings,
  };
};
