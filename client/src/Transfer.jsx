import { useState, useEffect } from "react";
import { keccak256 } from "ethereum-cryptography/keccak";
import { utf8ToBytes, toHex } from "ethereum-cryptography/utils";
import { sign, recoverPublicKey } from "ethereum-cryptography/secp256k1";

import server from "./server";

function Transfer({ address, setBalance }) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [privateKey, setPrivateKey] = useState("");

  useEffect(() => {
    const init = async () => {
      if (!address) return;
      try {
        const {
          data: { privateKey },
        } = await server.get(`key/${address}`, {
          sender: address,
          amount: parseInt(sendAmount),
          recipient,
        });
        setPrivateKey(privateKey);
      } catch (ex) {}
    };
    init();
  }, [address]);

  const setValue = (setter) => (evt) => setter(evt.target.value);

  async function transfer(evt) {
    evt.preventDefault();
    const hash = hashMessage("hello world");
    const { signature, recoveryBit } = await signMessage(hash);

    try {
      const {
        data: { balance },
      } = await server.post(`send`, {
        sender: address,
        amount: parseInt(sendAmount),
        recipient,
        hash,
        signature,
        recoveryBit,
      });
      setBalance(balance);
    } catch (ex) {}
  }

  const hashMessage = (message) => {
    const bytes = utf8ToBytes(message);
    return keccak256(bytes);
  };

  const signMessage = async (hash) => {
    const signedMessage = await sign(hash, privateKey, {
      recovered: true,
    });
    const signature = signedMessage[0];
    const recoveryBit = signedMessage[1];
    return { signature, recoveryBit };
  };

  return (
    <form className="container transfer" onSubmit={transfer}>
      <h1>Send Transaction</h1>

      <label>
        Send Amount
        <input
          placeholder="1, 2, 3..."
          value={sendAmount}
          onChange={setValue(setSendAmount)}
        ></input>
      </label>
      <label>
        Recipient
        <input
          placeholder="Type an address, for example: 0x2"
          value={recipient}
          onChange={setValue(setRecipient)}
        ></input>
      </label>
      <label>
        Private Key
        <input
          placeholder="Enter private key..."
          value={privateKey}
          readOnly
        ></input>
      </label>

      <input type="submit" className="button" value="Transfer" />
    </form>
  );
}

export default Transfer;
