import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalCloseButton,
  ModalBody,
  Box,
  HStack,
  Text,
  Image,
  Flex,
  Tooltip,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  TabIndicator,
  Spinner,
} from '@chakra-ui/react';
import { useState } from 'react';

import { DelegateUnbondingTable } from './delegate-unbonding-table';
import { DelegateValidatorTable } from './delegate-validator-table';
// import { validatorsData } from './mock/validator';
import { useDelegate } from './hooks/useDelegate';

type Props = {
  onClose: () => void;
};

export const Delegate = ({ onClose }: Props) => {
  const [tabIndex, setTabIndex] = useState<number>(1);
  const {
    toggleBonding,
    onChangeSlider,
    sliderValue,
    bonding,
    bJmesValue,
    jmesValue,
    selectedValidator,
    validatorList,
    isValidatorsLoading,
    setBondingState,
    valueToMove,
    isMovingNotValid,
    delegateTokens,
    delegatingToken,
  } = useDelegate();

  const handleTabsChange = (index: number) => {
    setTabIndex(index);
  };

  return (
    <>
      <Modal closeOnOverlayClick={false} isOpen={true} onClose={onClose}>
        <ModalOverlay bg="rgba(15, 0, 86, 0.6)" />
        <ModalContent
          maxH="506px"
          maxW="892px"
          background="transparent"
          borderRadius={12}
          marginTop={0}
          top="50%"
          transform="translateY(-50%) !important"
        >
          <ModalCloseButton zIndex={99} color="white" />
          <ModalBody width={892} padding={0}>
            <HStack>
              <Box
                width={547}
                height={506}
                background="#704FF7"
                borderLeftRadius={12}
                padding="0 33px"
                position="relative"
              >
                <Text
                  color="white"
                  fontFamily={'DM Sans'}
                  fontWeight="700"
                  fontSize={28}
                  lineHeight="39.2px"
                  marginTop="29px"
                  marginBottom="44px"
                  textAlign="center"
                >
                  Delegation
                </Text>
                <Flex alignItems="center" justifyContent="space-between">
                  <Box>
                    <Text
                      color="lilac"
                      fontFamily={'DM Sans'}
                      fontWeight="500"
                      fontSize={12}
                      lineHeight="20px"
                      textAlign="center"
                      marginBottom="12px"
                    >
                      {bonding ? 'From' : 'To'}
                    </Text>
                    <Box
                      width="200px"
                      height="72px"
                      borderRadius={12}
                      background="darkPurple"
                      paddingTop="9px"
                    >
                      <Text
                        color="white"
                        fontFamily={'DM Sans'}
                        fontWeight="500"
                        fontSize={11}
                        lineHeight="20px"
                        textAlign="center"
                      >
                        JMES balance
                      </Text>
                      <Text
                        color="white"
                        fontFamily={'DM Sans'}
                        fontWeight="700"
                        fontSize={28}
                        lineHeight="39.2px"
                        textAlign="center"
                      >
                        {jmesValue}
                      </Text>
                    </Box>
                  </Box>
                  <Box marginTop="34px">
                    <Tooltip
                      label={
                        'Click to change to ' + (bonding ? 'unBond' : 'Bond')
                      }
                    >
                      <Flex
                        width="50px"
                        height="50px"
                        borderRadius="50%"
                        background={bonding ? 'green' : 'lilac'}
                        justifyContent="center"
                        alignItems="center"
                        onClick={toggleBonding}
                      >
                        <Image
                          src="/arrow.svg"
                          alt="icon"
                          width={'19px'}
                          height={'15px'}
                          transition={'.2s all'}
                          transform={
                            bonding ? 'rotate(0deg)' : 'rotate(180deg)'
                          }
                        />
                      </Flex>
                    </Tooltip>
                  </Box>
                  <Box>
                    <Text
                      color="lilac"
                      fontFamily={'DM Sans'}
                      fontWeight="500"
                      fontSize={12}
                      lineHeight="20px"
                      textAlign="center"
                      marginBottom="12px"
                    >
                      {bonding ? 'To' : 'From'}
                    </Text>
                    <Box
                      width="200px"
                      height="72px"
                      borderRadius={12}
                      background="darkPurple"
                      paddingTop="9px"
                    >
                      <Text
                        color="white"
                        fontFamily={'DM Sans'}
                        fontWeight="500"
                        fontSize={11}
                        lineHeight="20px"
                        textAlign="center"
                      >
                        bJMES balance
                      </Text>
                      <Text
                        color="white"
                        fontFamily={'DM Sans'}
                        fontWeight="700"
                        fontSize={28}
                        lineHeight="39.2px"
                        textAlign="center"
                      >
                        {bJmesValue}
                      </Text>
                    </Box>
                  </Box>
                </Flex>
                <Box marginTop="75px">
                  <Slider
                    isDisabled={delegatingToken}
                    defaultValue={0}
                    onChange={onChangeSlider}
                  >
                    <SliderTrack
                      background="darkPurple"
                      height="16px"
                      borderRadius="8px"
                    >
                      <SliderFilledTrack
                        background={bonding ? 'green' : 'lilac'}
                      />
                    </SliderTrack>
                    <SliderThumb
                      width="20px"
                      height="33px"
                      background="lilac"
                      border="2px solid"
                      borderColor="purple"
                      boxShadow="0px 1px 1px rgba(0, 0, 0, 0.25)"
                      position="relative"
                      borderRadius="4px"
                    >
                      <Box
                        width="16px"
                        height="1px"
                        background="purple"
                        transform="rotate(90deg)"
                        position="relative"
                        _before={{
                          content: '""',
                          position: 'absolute',
                          top: '-4px',
                          background: 'purple',
                          width: '16px',
                          height: '1px',
                        }}
                        _after={{
                          content: '""',
                          position: 'absolute',
                          bottom: '-4px',
                          background: 'purple',
                          width: '16px',
                          height: '1px',
                        }}
                      ></Box>
                      <Box
                        height="30px"
                        width="55px"
                        background="purple"
                        position="absolute"
                        bottom="calc(100% + 15px)"
                        left="50%"
                        transform="translateX(-50%)"
                        borderRadius={12}
                        boxShadow="0px 3.5px 5.5px rgba(0, 0, 0, 0.02)"
                        _after={{
                          content: '""',
                          borderTop: '15px solid purple',
                          borderLeft: '7.5px solid transparent',
                          borderRight: '7.5px solid transparent',
                          position: 'absolute',
                          top: '100%',
                          left: '50%',
                          transform: 'translateX(-50%)',
                        }}
                      >
                        <Text
                          color="white"
                          fontFamily={'DM Sans'}
                          fontWeight="500"
                          fontSize={16}
                          lineHeight="15px"
                          textAlign="center"
                          marginTop="8px"
                        >
                          {sliderValue}%
                        </Text>
                      </Box>
                    </SliderThumb>
                  </Slider>

                  <Text color="red" fontSize="sm" height="4" textShadow="md">
                    {isMovingNotValid}
                  </Text>
                </Box>
                <Button
                  display="flex"
                  backgroundColor={bonding ? 'green' : 'lilac'}
                  borderRadius={90}
                  alignContent="end"
                  minWidth={'159px'}
                  width="auto"
                  height={'48px'}
                  alignSelf="center"
                  onClick={delegateTokens}
                  _hover={{ bg: bonding ? 'green' : 'lilac' }}
                  variant={'outline'}
                  borderWidth={'1px'}
                  borderColor={'rgba(0,0,0,0.1)'}
                  marginTop="30px"
                  marginBottom="40px"
                  marginX="auto"
                  disabled={
                    !selectedValidator ||
                    !!isMovingNotValid ||
                    !!delegatingToken
                  }
                >
                  {delegatingToken && (
                    <Spinner mr={4} size="sm" color="white" />
                  )}
                  <Text
                    color="midnight"
                    fontFamily={'DM Sans'}
                    fontWeight="medium"
                    fontSize={14}
                  >
                    {bonding ? 'Bond' : 'UnBond'}
                    <Image
                      src="/delegate-midnight.svg"
                      display="inline-block"
                      alt="icon"
                      width={'9px'}
                      height={'10px'}
                      marginLeft="8px"
                    />
                    {valueToMove}
                  </Text>
                </Button>
                <Text
                  color="lilac"
                  fontFamily={'DM Sans'}
                  fontWeight="400"
                  fontSize={11}
                  lineHeight="14px"
                  textAlign="center"
                  padding="0 45px"
                  position="absolute"
                  bottom="24px"
                  left="0"
                  width="100%"
                >
                  Bonding JMES carries the risk of slashing. This means you
                  could lose some or all of your tokens. Do your own research
                  and only use bonding if you understand the consequences.
                </Text>
              </Box>
              <Box
                width={345}
                height={506}
                marginInlineStart="0 !important"
                background="darkPurple"
                borderRightRadius={12}
                position="relative"
              >
                <Tabs
                  variant="unstyled"
                  marginTop="41px"
                  padding="0 30px"
                  index={tabIndex}
                  onChange={handleTabsChange}
                >
                  <TabList>
                    <Tab
                      padding="0 0 10px"
                      opacity={0.5}
                      _selected={{ opacity: '1' }}
                    >
                      <Text
                        color="white"
                        fontFamily={'DM Sans'}
                        fontWeight="500"
                        fontSize={16}
                      >
                        My unbonding
                      </Text>
                    </Tab>
                    <Tab
                      padding="0 0 10px"
                      marginLeft="40px"
                      opacity={0.5}
                      _selected={{ opacity: '1' }}
                    >
                      <Text
                        color="white"
                        fontFamily={'DM Sans'}
                        fontWeight="500"
                        fontSize={16}
                      >
                        Select a validator
                      </Text>
                    </Tab>
                  </TabList>
                  <TabIndicator
                    mt="-1.5px"
                    height="2px"
                    bg="white"
                    borderRadius="1px"
                    width="80%"
                  />
                  <TabPanels>
                    <TabPanel padding={0} marginTop="30px">
                      <DelegateUnbondingTable />
                      <Text
                        color="lilac"
                        fontFamily={'DM Sans'}
                        fontWeight="400"
                        fontSize={11}
                        lineHeight="14px"
                        textAlign="center"
                        padding="0 41px"
                        position="absolute"
                        bottom="24px"
                        left="0"
                        width="100%"
                      >
                        Once unbonding bJMES is requested, it takes 21 days for
                        them to become available as JMES again.
                      </Text>
                    </TabPanel>
                    <TabPanel padding={0}>
                      {bonding ? (
                        <DelegateValidatorTable
                          selectedValidator={selectedValidator}
                          loading={isValidatorsLoading}
                          validatorsData={validatorList}
                          onSelectValidator={id => {
                            setBondingState(p => ({
                              ...p,
                              selectedValidator: id,
                            }));
                          }}
                        />
                      ) : (
                        <></>
                        // <UnBondValidatorTable
                        //   validatorsData={ValidatorsData?.bondedValidators}
                        //   selectValidator={() => {}}
                        // />
                      )}
                    </TabPanel>
                  </TabPanels>
                </Tabs>
              </Box>
            </HStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};
