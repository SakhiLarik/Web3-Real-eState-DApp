import React, { useState } from "react";
import { Web3 } from "web3";

function MakeTransaction() {
  const web3 = new Web3("http://127.0.0.1:7545");
  const MakeTransaction = async function () {
    const tx = {
      from: "0xe4ae2F1944424Df1257D15fe601DF7287a6A9Ccf",
      to: "0x5bb4968a4E53f31e6Cb08eA0F08Ed28227c96fA1",
      value: web3.utils.toWei(1, "ether"),
    };
    const txReceipt = await web3.eth.sendTransaction(tx);
    console.log("====================================");
    console.log(txReceipt);
    console.log("====================================");
  };
  return (
    <div>
      <button
        onClick={() => {
          MakeTransaction();
        }}
      >
        Send 1 Eth
      </button>
    </div>
  );
}

export default MakeTransaction;
