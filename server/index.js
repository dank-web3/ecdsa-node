const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;
const { recoverPublicKey } = require("ethereum-cryptography/secp256k1");
const { toHex } = require("ethereum-cryptography/utils");

app.use(cors());
app.use(express.json());

const balances = {
  "047413efb01fe2ae43a5b952d966fab5f13ac403ba17edd804a068159b9e6d08a89debd6f688d7be6d672151f7566aff8c3626ab794efa35013236bd9c91176ede": 100,
  "044162636e9c90a11f37a236e198019dc0ee41efc2184f906b998147c35b27132579fb047d43eac8e63af9843ea36ddca9da26bda2e0213e538397843c90a8faf9": 50,
  "04e967bfed84118267c656d1e1923c582839e782674c64609c367df0a897bba2eb340b0af461d93f3b7df5defff899d34169efcef7a85151a6bebd30e65ebdbd80": 75,
};

const privateKeys = {
  "047413efb01fe2ae43a5b952d966fab5f13ac403ba17edd804a068159b9e6d08a89debd6f688d7be6d672151f7566aff8c3626ab794efa35013236bd9c91176ede":
    "3bf9d28c1dda4721c7a03d0d22afcfbda0b255b8cad768e68989c7409dd92fcf",
  "044162636e9c90a11f37a236e198019dc0ee41efc2184f906b998147c35b27132579fb047d43eac8e63af9843ea36ddca9da26bda2e0213e538397843c90a8faf9":
    "e69937090fde85c8ab334d85f4ad01d6770d13ca95f110afb0c8109c2493369d",
  "04e967bfed84118267c656d1e1923c582839e782674c64609c367df0a897bba2eb340b0af461d93f3b7df5defff899d34169efcef7a85151a6bebd30e65ebdbd80":
    "b3ec28e6a37f4ab7b3a664ccd37cc83ed46ff30edaf1da3d33cb7d834c06dd07",
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.get("/key/:address", (req, res) => {
  const { address } = req.params;
  const privateKey = privateKeys[address] ?? "N/A";
  res.send({ privateKey });
});

app.post("/send", (req, res) => {
  const { sender, recipient, amount, hash, signature, recoveryBit } = req.body;
  const parsedSignature = new Uint8Array(
    Object.keys(signature).map((i) => signature[i])
  );
  const parsedHash = new Uint8Array(Object.keys(hash).map((i) => hash[i]));

  try {
    const publicKey = recoverPublicKey(
      parsedHash,
      parsedSignature,
      recoveryBit
    );

    if (toHex(publicKey) !== sender) {
      res.status(400).send({ message: "Not your account!" });
      return;
    }

    setInitialBalance(sender);
    setInitialBalance(recipient);

    if (balances[sender] < amount) {
      res.status(400).send({ message: "Not enough funds!" });
      return;
    } else {
      balances[sender] -= amount;
      balances[recipient] += amount;
      res.send({ balance: balances[sender] });
    }
  } catch (e) {
    res.status(500).send({ message: e.message });
    return;
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}
