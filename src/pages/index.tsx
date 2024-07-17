// pages/index.tsx
import Head from "next/head";
import { useContext, useEffect } from "react";
import { useRouter } from "next/router";
import { AuthContext } from "@/src/contexts/AuthContext";
import Loading from "@/src/components/loading";

export default function Home() {

  const { signed, loadingAuth, initialLoading, user } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    if (!initialLoading && !signed) {
      router.push("/login");
    }
  }, [initialLoading, signed, router]);

  if (initialLoading || loadingAuth) {
    return <Loading />;
  }

  return (
    <>
      <Head>
        <title>Dashboard - Bem vindo!</title>
      </Head>

      <div>
        {signed ? (
          <p>Welcome, {user?.name} ({user?.email})</p>
        ) : (
          <p>Please log in.</p>
        )}
      </div>
    </>
  );
}
