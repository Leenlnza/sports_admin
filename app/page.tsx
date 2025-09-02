"use client"

import { useState } from "react"
import { AdminDashboard } from "@/components/admin-dashboard"
import { LoginForm } from "@/components/login-form"

export default function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [username, setUsername] = useState("")

  const handleLogin = (user: string) => {
    setUsername(user)
    setIsLoggedIn(true)
  }

  const handleLogout = () => {
    setUsername("")
    setIsLoggedIn(false)
  }

  if (!isLoggedIn) {
    return <LoginForm onLogin={handleLogin} />
  }

  return <AdminDashboard username={username} onLogout={handleLogout} />
}
