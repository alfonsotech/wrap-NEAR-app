import React, { useEffect, useState } from 'react';
import { connect, WalletConnection, utils, Contract} from 'near-api-js';
import { getConfig } from './config';

const {
  format: { parseNearAmount, formatNearAmount },
} = utils;

const App = () => {
  const [wallet, setWallet] = useState(null);
  const [amount, setAmount] = useState(0);
  const [contract, setContract] = useState(null);
  const [balance, setBalance] = useState(null);

  useEffect(() => {
    connect(getConfig()).then((near) => setWallet(new WalletConnection(near)));
  }, []);

  // Define a NEAR contract interface.  This is the interface that will be used to call the contract.
  useEffect(() => {
    if(wallet) {
      setContract(
        new Contract(wallet.account(), 'wrap.testnet', {
          changeMethods: ['near_deposit'],
          viewMethods: ['ft_balance_of'],
        }),
      );
    }
  }, [wallet]);

  const isSignedIn = Boolean(wallet && wallet.isSignedIn() && contract);

  const handleLogin = () => { 
    wallet.requestSignIn({
      contractId: 'wrap.testnet',
      methodNames: ['near_deposit'],
    });
  };

  useEffect(() => {
    if (isSignedIn) {
      contract
        .ft_balance_of({ account_id: wallet.getAccountId() })
        .then((balance) => setBalance(formatNearAmount(balance)));
    }
  }, [wallet, contract, isSignedIn]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await contract.near_deposit( {
      args: {},
      amount: parseNearAmount(amount),
    });
  };
  
  return (
    <div>
      {!isSignedIn && (
        <button onClick={() => handleLogin()}>Login with NEAR</button>
      )}
      <p>Current Wrapped Balance: {balance}</p>
      <form onSubmit={handleSubmit}>
        <label>
          Deposit:
          <input
            type="number"
            name="deposit"
            value={amount}
            onChange={({ target: { value } }) => setAmount(value)}
          />
        </label>
        <input type="submit" value="Wrap NEAR" />
      </form>
    </div>
  );
};

export default App;
