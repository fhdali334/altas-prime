"use client"

import type React from "react"

import { useState } from "react"
import { Eye, EyeOff, Check, Circle } from "lucide-react"

interface SetupAccountProps {
  email: string
  onSuccess: () => void
}

export default function SetupAccount({ email, onSuccess }: SetupAccountProps) {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const hasUpperLower = /[a-z]/.test(password) && /[A-Z]/.test(password)
  const hasNumber = /\d/.test(password)
  const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password)
  const hasMinLength = password.length >= 8

  const isValid = hasUpperLower && hasNumber && hasSymbol && hasMinLength

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid) return

    try {
      // TODO: Implement actual registration API call
      console.log("Creating account...", {
        email,
        firstName,
        lastName,
        phone,
        password,
      })

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      onSuccess()
    } catch (error) {
      console.error("Registration failed:", error)
    }
  }

  const ValidationItem = ({ isValid, children }: { isValid: boolean; children: React.ReactNode }) => (
    <li className={`flex items-center ${isValid ? "text-green-600" : "text-gray-500"}`}>
      <span className="mr-2">{isValid ? <Check className="w-4 h-4" /> : <Circle className="w-4 h-4" />}</span>
      {children}
    </li>
  )

  return (
    <div className="w-full max-w-md bg-white rounded-xl p-8 mx-auto shadow-lg">
      <h1 className="text-3xl font-semibold text-center mb-6">Setup your Account</h1>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100 text-gray-500 cursor-not-allowed"
            disabled
          />
        </div>

        <div className="mb-4 flex gap-2">
          <div className="w-1/2">
            <label className="block text-sm font-medium mb-1" htmlFor="firstName">
              First Name
            </label>
            <input
              id="firstName"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="First Name"
            />
          </div>
          <div className="w-1/2">
            <label className="block text-sm font-medium mb-1" htmlFor="lastName">
              Last Name
            </label>
            <input
              id="lastName"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Last Name"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1" htmlFor="phone">
            Phone Number
          </label>
          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Phone Number"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1" htmlFor="password">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter a password"
            />
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 focus:outline-none"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <ul className="mb-6 space-y-1 text-sm">
          <ValidationItem isValid={hasUpperLower}>Use upper and lower case letters (e.g. Aa)</ValidationItem>
          <ValidationItem isValid={hasNumber}>Use a number (e.g. 1234)</ValidationItem>
          <ValidationItem isValid={hasSymbol}>Use a symbol (e.g. !@#$)</ValidationItem>
          <ValidationItem isValid={hasMinLength}>Use 8 or more characters</ValidationItem>
        </ul>

        <button
          type="submit"
          className={`w-full py-2 rounded-md text-white font-semibold transition ${
            isValid ? "bg-blue-600 hover:bg-blue-700 cursor-pointer" : "bg-gray-300 cursor-not-allowed"
          }`}
          disabled={!isValid}
        >
          Create Account
        </button>
      </form>
    </div>
  )
}
