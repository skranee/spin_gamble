import styles from "../styles/components/TwoStepVerification.module.scss";
import { useState, useRef, useEffect, useContext } from "react";
import React from "react";
import axios from "axios";
import { userContext } from "../context/user";
import { toast } from "react-toastify";

export default function Promo(props) {
  const pop = useRef(null);

  const user = useContext(userContext);

  const [code, setCode] = useState("");

  const click = (e) => {
    if (!pop.current?.contains(e.target)) props.setShow(false);
  };

  useEffect(() => {
    if (!props.setShow) return;
    window.addEventListener("click", click);
    return () => window.removeEventListener("click", click);
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    axios
      .post("/api/auth", {
        ctype: "2fa",
        challengeId: props.ticket,
        mediaType: props.mediaType,
        code,
        roblox_id: props.id.toString(),
      })
      .then((response) => {
        user.setLoggedIn(true);
        props.setShow(false);
      })
      .catch((err) => {
        toast.error(
          "Error Logging in with 2FA. Please check console for more information."
        );
      });
  }

  return (
    <div className={styles.dulledBackground}>
      <div ref={pop} className={styles.promoContainer}>
        <h1>2FA Code</h1>
        <p>
          A 2FA Code is needed to complete the login process. A code should have
          been emailed/texted to you or you may have an authenticator app where
          you can access your code.
        </p>
        <form onSubmit={handleSubmit}>
          <input
            onChange={(e) => setCode(e.target.value)}
            value={code}
            id="code"
            autoComplete="off"
            name="Code"
            required
            type="text"
            placeholder="Enter 2FA Code..."
          />
          <button onClick={handleSubmit}>Submit</button>
        </form>
      </div>
    </div>
  );
}
