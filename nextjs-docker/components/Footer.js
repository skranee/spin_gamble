import styles from '../styles/components/Footer.module.scss';
import Image from 'next/image';
import Link from 'next/link';

const legal = [
  {
    name: 'Terms of Service',
    link: '/terms-of-service'
  },
  {
    name: 'Privacy Policy',
    link: '/privacy-policy'
  },
  {
    name: 'Provably Fair',
    link: '/provably-fair'
  }
];

const support = [
  {
    name: 'FAQ',
    link: '/frequently-answered-questions'
  },
  {
    name: 'Contact',
    link: '/contact'
  }
];

const social = [
  {
    name: 'Discord',
    link: 'https://discord.gg/UGdAbu7QyB',
    newTab: true
  },
  {
    name: 'Terms of Service',
    link: '/twitter'
  }
];

function LinkElement(props) {
  return (
    <li>
      {props.newTab && (
        <a target="_blank" href={props.link}>
          {props.name}
        </a>
      )}
      {!props.newTab && (
        <Link href={props.link}>
          <a>{props.name}</a>
        </Link>
      )}
    </li>
  );
}

function Footer() {
  return (
    <footer className={styles.footerContainer}>
      <div className={styles.logoContainer}>
        <div className={styles.logoImage}>
          <Image
            src="/Header-Icons/LogoRbx.png"
            alt="Footer Logo"
            layout="fill"
            objectFit="cover"
            objectPosition="center"
          />
        </div>
        <span className={styles.legalDisclaimer}>
          Rbxspin is not affiliated, sponsored, or endorsed by Roblox
          Corporation
        </span>
      </div>
      <div className={styles.legalContainer}>
        <span className={styles.header}>About</span>
        <ul>
          {legal.map((item, index) => (
            <LinkElement
              key={`legal-${index + 1}`}
              name={item.name}
              link={item.link}
            />
          ))}
        </ul>
      </div>
      <div className={styles.supportContainer}>
        <span className={styles.header}>Help</span>
        <ul>
          {support.map((item, index) => (
            <LinkElement
              key={`support-${index + 1}`}
              name={item.name}
              link={item.link}
            />
          ))}
        </ul>
      </div>
      <div className={styles.socialsContainer}>
        <span className={styles.header}>Connect</span>
        <ul>
          {social.map((item, index) => (
            <LinkElement
              key={`social-${index + 1}`}
              name={item.name}
              link={item.link}
              newTab={item.newTab}
            />
          ))}
        </ul>
      </div>
    </footer>
  );
}

export default Footer;
