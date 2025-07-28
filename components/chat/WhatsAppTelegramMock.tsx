"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X, MessageCircle, Send } from "lucide-react"

interface WhatsAppTelegramMockProps {
  onClose: () => void
}

export default function WhatsAppTelegramMock({ onClose }: WhatsAppTelegramMockProps) {
  const [platform, setPlatform] = useState<"whatsapp" | "telegram">("whatsapp")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [chatId, setChatId] = useState("")

  const handleConnect = () => {
    // Mock connection logic
    console.log(`Connecting to ${platform}`, { phoneNumber, chatId })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">Chat Integration</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-4 space-y-4">
          {/* Platform Selection */}
          <div>
            <Label>Platform</Label>
            <div className="flex space-x-2 mt-2">
              <button
                onClick={() => setPlatform("whatsapp")}
                className={`flex-1 p-3 rounded-md border ${
                  platform === "whatsapp" ? "border-green-500 bg-green-50 text-green-700" : "border-gray-300"
                }`}
              >
                <MessageCircle className="w-5 h-5 mx-auto mb-1" />
                WhatsApp
              </button>
              <button
                onClick={() => setPlatform("telegram")}
                className={`flex-1 p-3 rounded-md border ${
                  platform === "telegram" ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-300"
                }`}
              >
                <Send className="w-5 h-5 mx-auto mb-1" />
                Telegram
              </button>
            </div>
          </div>

          {/* Configuration */}
          {platform === "whatsapp" && (
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+1234567890"
              />
            </div>
          )}

          {platform === "telegram" && (
            <div>
              <Label htmlFor="chatId">Chat ID</Label>
              <Input
                id="chatId"
                value={chatId}
                onChange={(e) => setChatId(e.target.value)}
                placeholder="@username or chat_id"
              />
            </div>
          )}

          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
            <p className="text-sm text-yellow-800">
              <strong>Demo Mode:</strong> This is a mock integration for demonstration purposes.
            </p>
          </div>

          <Button onClick={handleConnect} className="w-full">
            Connect to {platform === "whatsapp" ? "WhatsApp" : "Telegram"}
          </Button>
        </div>
      </div>
    </div>
  )
}
