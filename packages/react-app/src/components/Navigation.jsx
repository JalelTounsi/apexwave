import React, { useEffect, useState } from "react";
import { useEthers, useLookupAddress, useEtherBalance } from "@usedapp/core";
import { formatEther } from "@ethersproject/units";
import { getDefaultProvider } from "ethers";

import Nav from "react-bootstrap/Nav";
import {Link} from "./index"
function WalletAddress() {
  const [rendered, setRendered] = useState("");

  const { ens } = useLookupAddress();
  const { account, activateBrowserWallet, deactivate, error } = useEthers();

  useEffect(() => {
    if (ens) {
      setRendered(ens);
    } else if (account) {
      setRendered(account);
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
    <span>
      {rendered}
      {/* {rendered === "" && "Connect Wallet"}
        {rendered !== "" && rendered} */}
    </span>
  );
}

function Navigation() {
  const { account } = useEthers();
  const etherBalance = useEtherBalance(account);
  const network = function network() {
    if (window.ethereum.networkVersion === "1") {
      return "Mainnet";
    }
    if (window.ethereum.networkVersion === "5") {
      return "Goerli";
    }
    if (window.ethereum.networkVersion === "11155111") {
      return "Sepolia";
    } else {
      return "unknown";
    }
  };
  return (
    <>
      <Nav className="justify-content-end" activeKey="/home">
        {/* <Nav.Item>
          <Nav.Link href="/home" id="1">Active</Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey="link-1" id="2">Link</Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey="link-2" id="3">Link</Nav.Link>
        </Nav.Item> */}
        <Nav.Item>
          <Nav.Link eventKey="disabled" disabled>
            {network()}
          </Nav.Link>
          
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey="disabled" disabled>
            {WalletAddress()}
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey="disabled" disabled></Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey="disabled" disabled>
            <div>
              {etherBalance && (
                <div className="balance bold">
                  Balance: {formatEther(etherBalance)} ETH
                </div>
              )}
            </div>
          </Nav.Link>
        </Nav.Item>
      </Nav>
    </>
  );
}

export default Navigation;
