import Layout from "../components/Layout";
import { UserContextProvider } from "../context/user";
import { SocketContextProvider } from "../context/socket";
import { ToastContainer } from "react-toastify";
import "../styles/globals.scss";
import "../styles/fonts.scss";
import "react-toastify/dist/ReactToastify.css";

function MyApp({ Component, pageProps }) {
  return (
    <>
      <SocketContextProvider>
        <UserContextProvider>
          <Layout>
            <Component {...pageProps} id="top" />
          </Layout>
          <ToastContainer
            position="bottom-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="dark"
          />
        </UserContextProvider>
      </SocketContextProvider>
    </>
  );
}

export default MyApp;
