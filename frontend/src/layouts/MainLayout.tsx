import { useState } from 'react'
import { Box } from '@mui/material'
import { Outlet } from 'react-router-dom'

import Header from './Header'
import Footer from './Footer'
import Sidebar from '../shared/components/Sidebar'

import { HEADER_HEIGHT } from '../shared/constants/layout'

type MainLayoutProps = {
    mode: 'light' | 'dark'
    setMode: React.Dispatch<React.SetStateAction<'light' | 'dark'>>
}

export default function MainLayout({
    mode,
    setMode,
}: MainLayoutProps) {
    // Sidebar'ın kalıcı olarak açık olup olmadığı
    const [sidebarPinned, setSidebarPinned] =
        useState(false)

    // Sidebar'ın sadece hover nedeniyle geçici olarak açık olup olmadığı
    const [sidebarHovered, setSidebarHovered] =
        useState(false)

    // Gerçek görünürlük
    const sidebarOpen =
        sidebarPinned || sidebarHovered

    const handleToggleSidebar = () => {
        setSidebarPinned((prev) => !prev)

        // Sabitleme değişirken hover durumunu temizle
        setSidebarHovered(false)
    }

    const handleSidebarHover = (hovered: boolean) => {
        // Sidebar sabitlenmişse hover artık state'i değiştirmez
        if (sidebarPinned) {
            return
        }

        setSidebarHovered(hovered)
    }

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            {/* Fixed Header */}
            <Header
                mode={mode}
                setMode={setMode}
                sidebarOpen={sidebarOpen}
                onToggleSidebar={handleToggleSidebar}
            />

            {/* Header'ın fixed olması nedeniyle üst boşluk */}
            <Box
                sx={{
                    height: HEADER_HEIGHT,
                    flexShrink: 0,
                }}
            />

            <Box
                sx={{
                    display: 'flex',
                    flex: 1,
                    minHeight: 0,
                }}
            >
                <Sidebar
                    open={sidebarOpen}
                    onHoverChange={handleSidebarHover}
                />

                <Box
                    component="main"
                    sx={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        minWidth: 0,
                    }}
                >
                    <Box
                        sx={{
                            flex: 1,
                            p: { xs: 2, md: 4 },
                        }}
                    >
                        <Outlet />
                    </Box>

                    <Footer />
                </Box>
            </Box>
        </Box>
    )
}