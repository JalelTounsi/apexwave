import "bootstrap/dist/css/bootstrap.css";
import "./style/index.css";

import { DAppProvider, Mainnet, Sepolia, Goerli } from "@usedapp/core";
import React from "react";
import ReactDOM from "react-dom";

import App from "./App";

// IMPORTANT, PLEASE READ
// To avoid disruptions in your app, change this to your own Infura project id.
// https://infura.io/register
const config = {
  readOnlyChainId: Mainnet.chainId,
  readOnlyUrls: {
    [Mainnet.chainId]:
      "https://mainnet.infura.io/v3/817597f04d6941649c41255a1b10e815",
    [Sepolia.chainId]:
      "https://sepolia.infura.io/v3/817597f04d6941649c41255a1b10e815",
    [Goerli.chainId]:
      "https://goerli.infura.io/v3/817597f04d6941649c41255a1b10e815",
  },
};

ReactDOM.render(
  <React.StrictMode>
    <DAppProvider config={config}>
      <App />
    </DAppProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
