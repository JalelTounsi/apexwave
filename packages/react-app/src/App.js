import { Contract } from "@ethersproject/contracts";

import { shortenAddress, useCall, useEthers, useLookupAddress } from "@usedapp/core";
import React, { useEffect, useState } from "react";
import { ethers } from "ethers";

import { Body, Button, Container, Header, Image, Link } from "./components";
import CurrencyField from "./components/CurrencyField";

import { GearFill } from "react-bootstrap-icons";
import BeatLoader from "react-spinners/BeatLoader";

import {
  getFirstTokenContract,
  getSecondTokenContract,
  getPrice,
  runSwap,
} from "./logic/AlphaRouterService";

import logo from "./media/ethereumLogo.png";

import { addresses, abis } from "@uniswap-v2-app/contracts";

function WalletButton() {
  const [rendered, setRendered] = useState("");

  const { ens } = useLookupAddress();
  const { account, activateBrowserWallet, deactivate, error } = useEthers();

  useEffect(() => {
    if (ens) {
      setRendered(ens);
    } else if (account) {
      setRendered(shortenAddress(account));
    } else {
      setRendered("");
    }
  }, [account, ens, setRendered]);

  useEffect(() => {
    if (error) {
      console.error("Error while connecting wallet:", error.message);
    }
  }, [error]);

  return (
    <Button
      onClick={() => {
        if (!account) {
          activateBrowserWallet();
        } else {
          deactivate();
        }
      }}
    >
      {rendered === "" && "Connect Wallet"}
      {rendered !== "" && rendered}
    </Button>
  );
}

function App() {
  // the by default code !!
  // Read more about useDapp on https://usedapp.io/
  // const { error: contractCallError, value: reserves } =
  //   useCall({
  //      contract: new Contract(addresses[MAINNET_ID].pairs["DAI-WETH"], abis.pair),
  //      method: "getReserves",
  //      args: [],
  //   }) ?? {};

  // const { loading, error: subgraphQueryError, data } = useQuery(GET_AGGREGATED_UNISWAP_DATA);

  // useEffect(() => {
  //   if (subgraphQueryError) {
  //     console.error("Error while querying subgraph:", subgraphQueryError.message);
  //     return;
  //   }
  //   if (!loading && data && data.uniswapFactories) {
  //     console.log({ uniswapFactories: data.uniswapFactories });
  //   }
  // }, [loading, subgraphQueryError, data]);

  // return (
  //   <Container>
  //     <Header>
  //       <WalletButton />
  //     </Header>
  //     <Body>
  //       <Image src={logo} alt="ethereum-logo" />
  //       <p>
  //         Edit <code>packages/react-app/src/App.js</code> and save to reload.
  //       </p>
  //       <Link href="https://reactjs.org">
  //         Learn React
  //       </Link>
  //       <Link href="https://usedapp.io/">Learn useDapp</Link>
  //       <Link href="https://uniswap.org/docs/v2/">Learn Uniswap v2</Link>
  //     </Body>
  //   </Container>
  // );

  const [provider, setProvider] = useState(undefined);
  const [signer, setSigner] = useState(undefined);
  const [signerAddress, setSignerAddress] = useState(undefined);
  const [slippageAmount, setSlippageAmount] = useState(1)
  const [deadlineMinutes, setDeadlineMinutes] = useState(10)
  const [inputAmount, setInputAmount] = useState(undefined);
  const [outputAmount, setOutputAmount] = useState(undefined);
  const [transaction, setTransaction] = useState(undefined);
  const [loading, setLoading] = useState(undefined);
  const [ratio, setRatio] = useState(undefined);
  const [FirstTokenContract, setFirstTokenContract] = useState(undefined);
  const [SecondTokenContract, setSecondTokenContract] = useState(undefined);
  const [FirstTokenAmount, setFirstTokenAmount] = useState(undefined);
  const [SecondTokenAmount, setSecondTokenAmount] = useState(undefined);

  useEffect(() => {
    const onLoad = async () => {
      const provider = await new ethers.providers.Web3Provider(window.ethereum);
      setProvider(provider);

      const FirstTokenContract = getFirstTokenContract();
      setFirstTokenContract(FirstTokenContract);

      const SecondTokenContract = getSecondTokenContract();
      setSecondTokenContract(SecondTokenContract);
    };
    onLoad();
  }, []);

  const getSigner = async (provider) => {
    provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    setSigner(signer);
  };
  //if the wallet connected?
  const isConnected = () => signer !== undefined;

  const getWalletAddress = () => {
    signer.getAddress().then((address) => {
      setSignerAddress(address);

      // todo: connect FirstToken and uni contracts
      FirstTokenContract.balanceOf(address)
        .then((res) => {
          setFirstTokenAmount(Number(ethers.utils.formatEther(res)));
        });
      SecondTokenContract.balanceOf(address)
        .then((res) => {
          setSecondTokenAmount(Number(ethers.utils.formatEther(res)));
        });
    });
  };

  if (signer !== undefined) {
    getWalletAddress();
  }

  const getSwapPrice = (inputAmount) => {
    setLoading(true);
    setInputAmount(inputAmount);

    const swap = getPrice(
      inputAmount,
      slippageAmount,
      Math.floor(Date.now() / 1000 + deadlineMinutes * 60),
      signerAddress
    ).then((data) => {
      setTransaction(data[0]);
      setOutputAmount(data[1]);
      setRatio(data[2]);
      setLoading(false);
    });
  };

  return (
    <div className="App">
      <Container>
        <Header>
          <WalletButton />
        </Header>
        <Body>
          <div className="row">
            <div className="col-md-4">
              <Image src={logo} alt="ethereum-logo" />
              <p>
                <code>GoldmanSats</code>, the DeFi liquidity aggregator
              </p>
            </div>
            <div className="col-md-8">

                <div className="swapContainer">
                  <div className="swapHeader">
                    <span className="swapText">Swap</span>
                  </div>

                  <div className="swapBody">
                    <CurrencyField
                      field="input"
                      tokenName="DAI"
                      getSwapPrice={getSwapPrice}
                      signer={signer}
                      balance={FirstTokenAmount}
                    />
                    <CurrencyField
                      field="output"
                      tokenName="WETH"
                      value={outputAmount}
                      signer={signer}
                      balance={SecondTokenAmount}
                      spinner={BeatLoader}
                      loading={loading}
                    />
                  </div>

                  <div className="ratioContainer">
                    {ratio && <>{`1 DAI = ${ratio} WETH`}</>}
                  </div>

                  <div className="swapButtonContainer">
                    {isConnected() ? (
                      <div
                        onClick={() => runSwap(transaction, signer)}
                        className="swapButton"
                      >
                        Swap
                      </div>
                    ) : (
                      <div
                        onClick={() => getSigner(provider)}
                        className="swapButton"
                      >
                        Connect Wallet
                      </div>
                    )}
                  </div>
                </div>
              
            </div>
          </div>
        </Body>
      </Container>
    </div>
  );
}

export default App;
