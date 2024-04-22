import Head from 'next/head';
import styles from '../styles/pages/Deposit.module.scss';
import Method from '../components/Method';
import { useState } from 'react';
import WithdrawPopup from '../components/Withdraw';
import { userContext } from '../context/user';
import { useContext } from 'react';

export default function Withdraw() {
  const [showPopup, setPopup] = useState(false);

  const userData = useContext(userContext);

  const withdrawMethods = [
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
  },*/
  ];

  return (
    <div className={styles.container}>
      <Head>
        <title>Rbxspin | the first robux sportsbook</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={styles.withdraw}>
        {!userData.isLoggedIn && (
          <h1 className={styles.notAuthorized}>
            Not Authorized. Please Log In
          </h1>
        )}
        {userData.isLoggedIn && (
          <>
            {showPopup && <WithdrawPopup setShow={setPopup} />}
            <h1 className={styles.title}>Withdraw</h1>
            <div className={styles.withdrawMethods}>
              {withdrawMethods.map((method, index) => (
                <Method
                  name={method.name}
                  image={method.image}
                  imgWidth={method.width}
                  imgHeight={method.height}
                  key={`withdraw-method-${index + 1}`}
                  click={method.onClick}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
