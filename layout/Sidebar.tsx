"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { MessageCircle, Plus, Users, Download, Settings, Crown } from "lucide-react"

const menuItems = [
  { href: "/dashboard", label: "ChatBot", icon: MessageCircle },
  { href: "/create-agent", label: "Create Agent", icon: Plus },
  { href: "/agents", label: "List Agents", icon: Users },
  { href: "/exports", label: "Exports", icon: Download },
  { href: "/settings", label: "Settings", icon: Settings },
]

const todayItems = [{ label: "Cash and Cash Equivalents" }, { label: "Prisma seeding fix" }]

const yesterdayItems = [{ label: "Django rental reminder fix" }]

const previousItems = [{ label: "Valid Email Regex" }, { label: "Football Ticket Outcome Upd" }]

interface SectionProps {
  title: string
  items: { label: string }[]
}

function Section({ title, items }: SectionProps) {
  return (
    <div>
      <div className="px-6 py-2 text-xs text-gray-500 font-semibold sticky top-0 bg-white z-10">{title}</div>
      <ul>
        {items.map((item, index) => (
          <li key={index}>
            <a
              href="#"
              className="flex items-center px-6 py-2 text-gray-700 hover:bg-gray-100 rounded-md font-medium mt-1"
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="fixed min-h-screen w-64 bg-white border-r flex flex-col shadow-md z-50">
      {/* Top: Main Menu */}
      <div className="flex flex-col gap-1 px-4 py-4">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 cursor-pointer hover:bg-gray-100 rounded px-2 py-1 ${
                isActive ? "bg-purple-50 text-purple-600" : ""
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-gradient-to-br from-purple-400 to-purple-600"></span>
              <span className="font-semibold text-gray-800">{item.label}</span>
            </Link>
          )
        })}
      </div>

      {/* Divider */}
      <div className="border-t my-2"></div>

      {/* Sections */}
      <div className="flex-1 overflow-y-auto">
        <Section title="Today" items={todayItems} />
        <Section title="Yesterday" items={yesterdayItems} />
        <Section title="Previous 7 Days" items={previousItems} />
      </div>

      {/* Upgrade Plan */}
      <div className="mt-auto px-4 py-3">
        <div className="flex items-center gap-2 bg-gray-50 border rounded-lg px-3 py-2 cursor-pointer hover:bg-gray-100">
          <Crown className="w-5 h-5 text-yellow-500" />
          <span className="font-medium text-gray-800">Upgrade plan</span>
        </div>
        <div className="text-xs text-gray-500 mt-1">More access to the best models</div>
      </div>
    </div>
  )
}
