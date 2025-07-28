"use client"

import { useState } from "react"
import multiavatar from "@multiavatar/multiavatar"

interface IconSelectProps {
  value?: string | null
  onChange: (value: string) => void
}

const avatars = [
  "Binx Bond",
  "Clementine",
  "Morty",
  "Rodion Raskolnikov",
  "Sam Solo",
  "Starcrasher",
  "Shack",
  "Desmond",
  "Snake Harrison",
  "Pandemonium",
  "Broomhilda",
  "Cosmo Blue",
  "Blue Meal Shake",
  "Cryptonaut",
  "Lancaster",
  "Maggot",
  "Matrix",
  "Hiro",
]

export default function IconSelect({ value, onChange }: IconSelectProps) {
  const [selectedAvatar, setSelectedAvatar] = useState(value || "")

  const getAvatarUrl = (name: string) => {
    return `data:image/svg+xml;base64,${btoa(multiavatar(name))}`
  }

  const selectAvatar = (avatar: string) => {
    setSelectedAvatar(avatar)
    onChange(avatar)
  }

  return (
    <div className="w-full">
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-4 p-4 max-h-64 overflow-y-auto border rounded-lg">
        {avatars.map((avatar) => (
          <div
            key={avatar}
            onClick={() => selectAvatar(avatar)}
            className={`cursor-pointer transition-transform hover:scale-110 ${
              selectedAvatar === avatar ? "ring-2 ring-blue-500 rounded-lg" : ""
            }`}
          >
            <img src={getAvatarUrl(avatar) || "/placeholder.svg"} alt={avatar} className="w-full h-auto rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  )
}
