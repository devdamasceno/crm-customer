// pages/index.tsx
import Head from "next/head";
import { useContext, useEffect } from "react";
import { useRouter } from "next/router";
import { getAuth, signOut } from "firebase/auth";
import { AuthContext } from "@/src/contexts/AuthContext";
import Loading from "@/src/components/loading";
import Button from "@/src/components/button";
import Dashboard from "@/src/components/dashboard";

export default function Home() {
  const { signed, initialLoading, user } = useContext(AuthContext);
  const router = useRouter();
  const auth = getAuth();

  useEffect(() => {
    if (!initialLoading && !signed) {
      router.push("/login");
    }
  }, [initialLoading, signed, router]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (err) {
      console.error("Failed to logout:", err);
    }
  };

  if (initialLoading) {
    return <Loading />;
  }

  if (!signed) {
    return null; 
  }

  return (
    <>
      <Head>
        <title>Dashboard - Bem vindo!</title>
      </Head>
      <Dashboard children={undefined} />
    </>
  );
}
