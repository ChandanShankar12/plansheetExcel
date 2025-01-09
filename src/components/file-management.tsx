'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FileText, Home, Plus, PlusCircle, Settings } from 'lucide-react'
import Link from "next/link"

interface FileItem {
  name: string
  member: string
  date: string
  time: string
}

export default function FileManagement() {
  const files: FileItem[] = Array(10).fill({
    name: "303_MDA 2024 Boothplan",
    member: "Aditi",
    date: "28/11/31",
    time: "11:28AM"
  })

  return (
    <div className="flex h-screen flex-col">
      {/* Header */}
      <header className="bg-green-600 p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold">Good Afternoon</h1>
            <p className="text-green-50">Hi, How can I help you today?</p>
          </div>
          <Button variant="outline" className="text-white hover:text-green-600">
            Sign In
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 border-r p-4">
          <div className="space-y-4">
            <Link 
              href="#" 
              className="flex items-center space-x-2 rounded-lg px-2 py-2 hover:bg-gray-100"
            >
              <Home className="h-5 w-5" />
              <span>Homepage</span>
            </Link>
            
            <div className="space-y-2">
              <h2 className="px-2 text-sm font-semibold">New File</h2>
              <Button variant="ghost" className="w-full justify-start">
                <FileText className="mr-2 h-5 w-5" />
                Create Blank Document
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <PlusCircle className="mr-2 h-5 w-5" />
                Create with AI Support
              </Button>
            </div>

            <Button variant="ghost" className="w-full justify-start">
              <Settings className="mr-2 h-5 w-5" />
              Settings
            </Button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Recent Files</h2>
              <Input 
                placeholder="Search by Booth number, supervisor name, employee name" 
                className="w-96"
              />
            </div>

            <ScrollArea className="h-[calc(100vh-220px)]">
              <div className="space-y-1">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-lg p-2 hover:bg-gray-100"
                  >
                    <div className="flex items-center space-x-4">
                      <FileText className="h-5 w-5 text-gray-500" />
                      <span>{file.name}</span>
                    </div>
                    <div className="flex items-center space-x-8">
                      <span className="text-sm text-gray-500">{file.member}</span>
                      <span className="text-sm text-gray-500">{file.date} {file.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </main>
      </div>
    </div>
  )
}

