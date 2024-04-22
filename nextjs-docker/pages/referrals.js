import Head from 'next/head';
import styles from '../styles/pages/Referrals.module.scss';
import Image from 'next/image';
import StatCard from '../components/StatCard';
import { useRef } from 'react';

const referralInfo = [
  {
    alt: 'Link Icon',
    image: '/Referral-Icons/paperclip.svg',
    imgWidth: 100,
    imgHeight: 100,
    description: 'Share your Referral Link with your friends or community below'
  },
  {
    alt: 'Chunk of Balance Icons floating around in various sizes',
    image: '/Referral-Icons/balance.svg',
    imgWidth: 189,
    imgHeight: 200,
    description: 'Your friends earn a 10% bonus on their first deposit'
  },
  {
    alt: 'Percentage Icon',
    image: '/Referral-Icons/percent.svg',
    imgWidth: 100,
    imgHeight: 100,
    description: 'You earn a lifetime 0.5% earning all of their winnings'
  }
];

const linkInfo = {
  link: 'https://rbxmillions.com/r/58174',
  amountReferred: 51,
  earnings: 568.55
};

const stats = [
  {
    title: 'Referred Users',
    value: linkInfo.amountReferred
  },
  {
    title: 'Total Earnings',
    value: linkInfo.earnings,
    isCredits: true
  }
];

function InfoItem(props) {
  return (
    <li className={styles.infoItemContainer}>
      <div className={styles.bg}>
        <div
          className={styles.imageContainer}
          style={{
            width: `${props.imgWidth}px`,
            height: `${props.imgHeight}px`
          }}>
          <Image
            src={props.image}
            width={props.imgWidth}
            height={props.imgHeight}
            alt={props.altText}
          />
        </div>
      </div>
      <p className={styles.description}>{props.description}</p>
    </li>
  );
}

export default function Referrals() {
  const copyLink = useRef(null);

  function copyToClipboard(e) {
    e.preventDefault();
    navigator.clipboard.writeText(linkInfo.link).catch(console.error);
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Rbxspin | the first robux sportsbook</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={styles.referrals}>
        <h1>Referrals</h1>
        <p>
          Invite your friends to Rbxspin and receive a lifetime percantage of
          their winnings.
        </p>

        <ul>
          {referralInfo.map((info, index) => (
            <InfoItem
              image={info.image}
              imgWidth={info.imgWidth}
              imgHeight={info.imgHeight}
              description={info.description}
              altText={info.alt}
              key={`info-box-${index + 1}`}
            />
          ))}
          <div className={styles.rocketShipContainer}>
            <Image
              src="/Referral-Icons/rocketShip.svg"
              width={1043}
              height={331}
              alt="Rocket Ship flying throught the sky"
            />
          </div>
        </ul>

        <h2>Referral Link</h2>
        <div className={styles.linkCopyContainer}>
          <div className={styles.linkContainer}>
            <p ref={copyLink} className={styles.link}>
              {linkInfo.link}
            </p>
          </div>
          <button onClick={copyToClipboard} className={styles.copyButton}>
            Copy
          </button>
        </div>

        <div className={styles.statsContainer}>
          {stats.map((stat, index) => (
            <StatCard
              title={stat.title}
              isCredits={stat.isCredits}
              value={stat.value}
              key={`statCard-${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
