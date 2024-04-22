import Head from 'next/head';
import styles from '../styles/pages/Profile.module.scss';
import Avatar from '../components/Avatar';
import Image from 'next/image';
import StatCard from '../components/StatCard';

const testUser = {
  name: 'Bids Test',
  image: '/Temporary-Icons/Profile-Pictures/viral.png'
};

const testTransactions = [
  {
    type: 'Deposit',
    gamemode: '-',
    value: 350
  },
  {
    type: 'Bet',
    gamemode: 'Crash',
    value: -350
  },
  {
    type: 'Bet',
    gamemode: 'Coinflip',
    value: 350
  }
];

const testStats = [
  {
    title: 'Total Wagered',
    isCredits: true,
    value: 24491
  },
  {
    title: 'Total Deposited',
    isCredits: true,
    value: 24491
  },
  {
    title: 'Total Withdrawn',
    isCredits: true,
    value: 24491
  }
];

function Transaction(props) {
  let icon, textColor;
  if (props.type === 'Bet' && props.value > 0) {
    icon = '/greenBalance.svg';
    textColor = '#00FF0A';
  } else if (props.type === 'Bet' && props.value < 0) {
    icon = '/redBalance.svg';
    textColor = '#FF2D2D';
  } else {
    icon = '/greyBalance.svg';
    textColor = '#CFCFCF';
  }

  return (
    <div className={styles.transaction}>
      <div className={styles.type}>{props.type}</div>
      <div className={styles.gamemode}>{props.gamemode}</div>
      <div className={styles.value} style={{ color: textColor }}>
        <div className={styles.creditContainer}>
          <Image src={icon} alt="Balance Icon" width={18} height={19} />
        </div>
        {props.value}
      </div>
    </div>
  );
}

export default function Profile() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Rbxspin | the first robux sportsbook</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={styles.profile}>
        <div className={styles.userInfo}>
          <Avatar
            size={92}
            borderRadius={18}
            thickness={4}
            image={testUser.image}
          />
          <h1>{testUser.name}</h1>
        </div>

        <h2>Stats</h2>
        <div className={styles.statsContainer}>
          {testStats.map((stat, index) => (
            <StatCard
              title={stat.title}
              value={stat.value}
              isCredits={stat.isCredits}
              key={`statsCard-${index + 1}`}
            />
          ))}
        </div>

        <h3>Transactions</h3>
        <div className={styles.transactionContainer}>
          <div className={styles.headers}>
            <span className={styles.type}>Type</span>
            <span className={styles.gamemode}>Gamemode</span>
            <span className={styles.amount}>Amount</span>
          </div>
          <div className={styles.table}>
            {testTransactions.length > 0 ? (
              testTransactions.map((transaction, index) => (
                <Transaction
                  type={transaction.type}
                  gamemode={transaction.gamemode}
                  value={transaction.value}
                  key={`transaction-${index + 1}`}
                />
              ))
            ) : (
              <div className={styles.noData}>No Transaction Data Here :(</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
