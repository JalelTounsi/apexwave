import 'bootstrap/dist/css/bootstrap.css';
import './style/index.css';

import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";
import { DAppProvider, Mainnet, Sepolia, Goerli } from "@usedapp/core";
import React from "react";
import ReactDOM from "react-dom";

import App from "./App";

// IMPORTANT, PLEASE READ
// To avoid disruptions in your app, change this to your own Infura project id.
// https://infura.io/register
const INFURA_PROJECT_ID = "817597f04d6941649c41255a1b10e815";
const config = {
  readOnlyChainId: Goerli.chainId,
  readOnlyUrls: {
    [Mainnet.chainId]: "https://mainnet.infura.io/v3/817597f04d6941649c41255a1b10e815",
    [Sepolia.chainId]: "https://sepolia.infura.io/v3/817597f04d6941649c41255a1b10e815",
    [Goerli.chainId]: "https://goerli.infura.io/v3/817597f04d6941649c41255a1b10e815"

  },
}

// This is the official Uniswap v2 subgraph. You can replace it with your own, if you need to.
// See all subgraphs: https://thegraph.com/explorer/
const client = new ApolloClient({
  cache: new InMemoryCache(),
  uri: "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2",
});

ReactDOM.render(
  <React.StrictMode>
    <DAppProvider config={config}>
      <ApolloProvider client={client}>
        <App />
      </ApolloProvider>
    </DAppProvider>
  </React.StrictMode>,
  document.getElementById("root"),
);
