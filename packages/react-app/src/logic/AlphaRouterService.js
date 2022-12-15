//const { AlphaRouter } = require('@uniswap/smart-order-router')
import { AlphaRouter } from "@uniswap/smart-order-router";
const {
  Token,
  CurrencyAmount,
  TradeType,
  Percent,
} = require("@uniswap/sdk-core");
const { ethers, BigNumber } = require("ethers");
const JSBI = require("jsbi");
const ERC20ABI = require("./erc20.abi.json");

const V3_SWAP_ROUTER_ADDRESS = "0x6C9FC64A53c1b71FB3f9Af64d1ae3A4931A5f4E9";
const INFURA_URL_ =
  "https://goerli.infura.io/v3/817597f04d6941649c41255a1b10e815";
const CHAIN_ID = 1;
const web3Provider = new ethers.providers.JsonRpcProvider(INFURA_URL_);
const router = new AlphaRouter({ chainId: CHAIN_ID, provider: web3Provider });

//les tokens (pour le moment c'est hardcoded)

const nameFirstToken = "DAI";
const symbolFirstToken = "DAI";
const decimalsFirstToken = 18;
const addressFirstToken = "0xE68104D83e647b7c1C15a91a8D8aAD21a51B3B3E";

const nameSecondToken = "WETH";
const symbolSecondToken = "WETH";
const decimalsSecondToken = 18;
const addressSecondToken = "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6";

const FirstToken = new Token(
  CHAIN_ID,
  addressFirstToken,
  decimalsFirstToken,
  symbolFirstToken,
  nameFirstToken
);
const SecondToken = new Token(
  CHAIN_ID,
  addressSecondToken,
  decimalsSecondToken,
  symbolSecondToken,
  nameSecondToken
);

export const getFirstTokenContract = () =>
  new ethers.Contract(addressFirstToken, ERC20ABI, web3Provider);
export const getSecondTokenContract = () =>
  new ethers.Contract(addressSecondToken, ERC20ABI, web3Provider);

export const getPrice = async (
  inputAmount,
  slippageAmount,
  deadline,
  walletAddress
) => {
  const percentSlippage = new Percent(slippageAmount, 100);
  const wei = ethers.utils.parseUnits(
    inputAmount.toString(),
    decimalsFirstToken
  );
  const currencyAmount = CurrencyAmount.fromRawAmount(
    FirstToken,
    JSBI.BigInt(wei)
  );

  const route = await router.route(
    currencyAmount,
    SecondToken,
    TradeType.EXACT_INPUT,
    {
      recipient: walletAddress,
      slippageTolerance: percentSlippage,
      deadline: deadline,
    }
  );

  const transaction = {
    data: route.methodParameters.calldata,
    to: V3_SWAP_ROUTER_ADDRESS,
    value: BigNumber.from(route.methodParameters.value),
    from: walletAddress,
    gasPrice: BigNumber.from(route.gasPriceWei),
    gasLimit: ethers.utils.hexlify(1000000),
  };

  const quoteAmountOut = route.quote.toFixed(6);
  const ratio = (inputAmount / quoteAmountOut).toFixed(3);

  return [transaction, quoteAmountOut, ratio];
};

export const runSwap = async (transaction, signer) => {
  const approvalAmount = ethers.utils.parseUnits("10", 18).toString();
  const contractFirstToken = getFirstTokenContract();
  await contractFirstToken
    .connect(signer)
    .approve(V3_SWAP_ROUTER_ADDRESS, approvalAmount);

  signer.sendTransaction(transaction);
};
