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

const mainnet_chainId = 1;
const sepolia_chainId = 11155111;
const Goerli_chainId = 5;

const V3_SWAP_ROUTER_ADDRESS = 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D;//0xE592427A0AEce92De3Edee1F18E0157C05861564;

const INFURA_URL_GOERLI = 'https://goerli.infura.io/v3/817597f04d6941649c41255a1b10e815';
const INFURA_URL_MAINNET = 'https://mainnet.infura.io/v3/817597f04d6941649c41255a1b10e815';

const CHAIN_ID = mainnet_chainId;
const INFURA_URL = INFURA_URL_MAINNET
const web3Provider = new ethers.providers.JsonRpcProvider(INFURA_URL);
const router = new AlphaRouter({ chainId: CHAIN_ID, provider: web3Provider });

//les tokens (pour le moment c'est hardcoded)

const nameFirstToken = "DAI";
const symbolFirstToken = "DAI";
const decimalsFirstToken = 18;
const addressFirstToken = CHAIN_ID === mainnet_chainId ? "0x6B175474E89094C44Da98b954EedeAC495271d0F" : "0x73967c6a0904aA032C103b4104747E88c566B1A2";

const nameSecondToken = "WETH";
const symbolSecondToken = "WETH";
const decimalsSecondToken = 18;
const addressSecondToken = CHAIN_ID === mainnet_chainId ? "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2" : "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6";

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
