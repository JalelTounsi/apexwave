import React, { useEffect, useState } from "react";
import { useEthers, useLookupAddress } from "@usedapp/core";
import { Button,ImageButton } from "./index";
import styled from "styled-components";

function WalletButton() {
  const [rendered, setRendered] = useState("");

  const { ens } = useLookupAddress();
  const { account, activateBrowserWallet, deactivate, error } = useEthers();

  useEffect(() => {
    if (ens) {
      setRendered(ens);
    } else if (account) {
      setRendered("Disconnect");
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
      <ImageButton src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/MetaMask_Fox.svg/800px-MetaMask_Fox.svg.png"/>
    </Button>
    
  );
}

export default WalletButton;
