import React, { ReactNode } from 'react'
import Navbar from '@/components/Navbar'
import SidebarWrapper from '../../../components/SidebarWrapper'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'brAInstorm',
  description: 'Video chat with an AI assistant',
  icons: '/icons/newlogo.png'
}

const RootLayout = ({ children }: { children: ReactNode }) => {
  return (
    <main className="relative">
      <Navbar />
      <SidebarWrapper>{children}</SidebarWrapper>
    </main>
  )
}

export default RootLayout
