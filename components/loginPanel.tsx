"use client";
import Dashboard from "@/dashboard"
import AdminPanel1 from "@/components/admin-panel"
import AdminLogin from "@/components/adminLogin"
import { useEffect, useState } from "react"

export default function LoginPanel({ userId }: { userId: string }) { 
  const [auth, setAuth] = useState(null); 
  
  useEffect(() => { 
    console.log(userId);
  }, []);
  
  return auth
  ? <AdminPanel1 data={auth.data} />
  : <AdminLogin userId={userId} onSuccess={(authPayload) => setAuth(authPayload)} />;

}