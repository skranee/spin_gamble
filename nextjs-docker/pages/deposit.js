import Head from 'next/head';
import styles from '../styles/pages/Deposit.module.scss';
import Method from '../components/Method';
import { useState } from 'react';
import DepositPopup from '../components/Deposit';
import { userContext } from '../context/user';
import { useContext } from 'react';

export default function Deposit() {
  const [showPopup, setPopup] = useState(false);

  const userData = useContext(userContext);

  const depositMethods = [
    {
      name: 'Robux',
      image: '/Deposit-Withdraw-Icons/robux.svg',
      width: 79,
      height: 82,
      onClick: setPopup
    }
    /*{
    name: "Roblox Items",
    image: "/Deposit-Withdraw-Icons/items.svg",
    width: 115,
    height: 115,
  },
  {
    name: "Crypto",
    image: "/Deposit-Withdraw-Icons/crypto.svg",
    width: 140,
    height: 120,
  },*/
    /*
  {
    name: "Giftcards",
    image: "/",
  },*/
  ];

  return (
    <div className={styles.container}>
      <Head>
        <title>Rbxspin | the first robux sportsbook</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={styles.deposit}>
        {!userData.isLoggedIn && (
          <h1 className={styles.notAuthorized}>
            Not Authorized. Please Log In
          </h1>
        )}
        {userData.isLoggedIn && (
          <>
            {showPopup && <DepositPopup setShow={setPopup} />}
            <h1 className={styles.title}>Deposit</h1>
            <div className={styles.depositMethods}>
              {depositMethods.map((method, index) => (
                <Method
                  name={method.name}
                  image={method.image}
                  imgWidth={method.width}
                  imgHeight={method.height}
                  click={method.onClick}
                  key={`deposit-method-${index + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
