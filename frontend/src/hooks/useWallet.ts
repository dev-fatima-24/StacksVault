"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { showConnect, UserSession, AppConfig } from "@stacks/connect";

function getSession() {
  const appConfig = new AppConfig(["store_write", "publish_data"]);
  return new UserSession({ appConfig });
}

const NET = () =>
  process.env.NEXT_PUBLIC_STACKS_NETWORK === "mainnet" ? "mainnet" : "testnet";

export function useWallet() {
  const sessionRef = useRef<UserSession | null>(null);
  const [address, setAddress] = useState<string | null>(null);

  // Lazy-init only in browser
  function session(): UserSession {
    if (!sessionRef.current) sessionRef.current = getSession();
    return sessionRef.current;
  }

  useEffect(() => {
    const s = session();
    if (s.isUserSignedIn()) {
      setAddress(s.loadUserData().profile.stxAddress[NET()]);
    }
  }, []);

  const connect = useCallback(() => {
    showConnect({
      appDetails: { name: "StacksVault", icon: "/favicon.ico" },
      userSession: session(),
      onFinish: () => setAddress(session().loadUserData().profile.stxAddress[NET()]),
    });
  }, []);

  const disconnect = useCallback(() => {
    session().signUserOut();
    setAddress(null);
  }, []);

  return { address, connect, disconnect };
}
