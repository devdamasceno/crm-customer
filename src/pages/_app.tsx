import "@/styles/globals.css";
import type { AppProps } from "next/app";
import AuthProvider from "@/src/contexts/AuthContext";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '@/styles/toastify.css'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <ToastContainer />
      <Component {...pageProps} />
    </AuthProvider>
  );
}
