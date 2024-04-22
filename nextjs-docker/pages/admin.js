import Head from 'next/head';
import styles from '../styles/pages/Admin.module.scss';
import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

export default function Admin(props) {
  const [robloxCookie, setRobloxCookie] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    axios
      .post('/api/admin/update_botAccounts', {
        roblox_key: robloxCookie
      })
      .then()
      .catch((err) => {
        toast.error(
          'Error Updating Bot Accounts. Please check console for more information.'
        );
      });
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Rbxspin | the first robux sportsbook</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={styles.admin}>
        {props.isAuthenticated ? (
          <>
            <h1>Admin Page</h1>
            <form onSubmit={handleSubmit}>
              <label htmlFor="rblxcookie">Roblox Cookie</label>
              <div>
                <input
                  onChange={(e) => setRobloxCookie(e.target.value)}
                  value={robloxCookie}
                  id="rblxcookie"
                  autoComplete="off"
                  name="Roblox Cookie"
                  required
                  type="text"
                />
              </div>
              <button className={styles.updateButton}>Update</button>
            </form>
          </>
        ) : (
          <h1 className={styles.unauthenticated}>Unauthenticated</h1>
        )}
      </div>
    </div>
  );
}

export async function getServerSideProps(ctx) {
  let allowAuth = false;
  await axios
    .post('http://localhost/api/admin/getAccess', null, {
      headers: ctx.req ? { cookie: ctx.req.headers.cookie } : undefined
    })
    .then((data) => {
      if (data.data === 'success') allowAuth = true;
    })
    .catch();
  return { props: { isAuthenticated: allowAuth } };
}
