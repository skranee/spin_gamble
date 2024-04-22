import Head from 'next/head';
import styles from '../styles/pages/404.module.scss';
import Link from 'next/link';

function Custom404() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Rbxspin | the first robux sportsbook</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={styles.home}>
        <h1>404 - Page Not Found</h1>
        <span>
          Welp. Don't know how you got here. But{' '}
          <Link href="/crash">
            <a>click here</a>
          </Link>{' '}
          to go home.
        </span>
      </div>
    </div>
  );
}

export default Custom404;
