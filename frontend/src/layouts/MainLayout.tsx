import { useEffect, useState } from 'react'
import { Box } from '@mui/material'
import { Outlet } from 'react-router-dom'

import Header from './Header'
import Footer from './Footer'
import Sidebar from '../shared/components/Sidebar'
import { useLocation } from 'react-router-dom'
import { HEADER_HEIGHT } from '../shared/constants/layout'

type MainLayoutProps = {
    mode: 'light' | 'dark'
    setMode: React.Dispatch<
        React.SetStateAction<'light' | 'dark'>
    >
}

export default function MainLayout({
    mode,
    setMode,
}: MainLayoutProps) {
    const [sidebarPinned, setSidebarPinned] =
        useState(false)

    const [sidebarHovered, setSidebarHovered] =
        useState(false)

    const [mobileOpen, setMobileOpen] =
        useState(false)

    const sidebarOpen =
        sidebarPinned || sidebarHovered

    const handleToggleSidebar = () => {
        setSidebarPinned((prev) => !prev)
        setSidebarHovered(false)
    }

    const location = useLocation()

    const handleSidebarHover = (
        hovered: boolean
    ) => {
        if (sidebarPinned) {
            return
        }

        setSidebarHovered(hovered)
    }

    useEffect(() => {
        if (!sidebarPinned) {
            return
        }

        const handleOutsideClick = (
            event: MouseEvent
        ) => {
            const target =
                event.target as Node

            const sidebar =
                document.getElementById(
                    'main-sidebar'
                )

            const toggleButton =
                document.getElementById(
                    'sidebar-toggle'
                )

            const clickedInsideSidebar =
                sidebar?.contains(target)

            const clickedToggleButton =
                toggleButton?.contains(target)

            if (
                !clickedInsideSidebar &&
                !clickedToggleButton
            ) {
                setSidebarPinned(false)
            }
        }

        document.addEventListener(
            'mousedown',
            handleOutsideClick
        )

        return () => {
            document.removeEventListener(
                'mousedown',
                handleOutsideClick
            )
        }
    }, [sidebarPinned])

    return (
        <Box
            sx={{
                minHeight: '100vh',
                width: '100%',
                maxWidth: '100%',

                overflowX: 'hidden',

                display: 'flex',
                flexDirection: 'column',
            }}
        >
            <Header
                mode={mode}
                setMode={setMode}
                sidebarOpen={sidebarOpen}
                onToggleSidebar={
                    handleToggleSidebar
                }
                onOpenMobileSidebar={() =>
                    setMobileOpen(true)
                }
            />

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
                    minWidth: 0,

                    width: '100%',
                    maxWidth: '100%',
                }}
            >
                <Sidebar
                    open={sidebarOpen}
                    mobileOpen={mobileOpen}
                    onHoverChange={
                        handleSidebarHover
                    }
                    onCloseMobile={() =>
                        setMobileOpen(false)
                    }
                />

                <Box
                    component="main"
                    sx={{
                        flex: 1,

                        minWidth: 0,
                        width: '100%',
                        maxWidth: '100%',

                        display: 'flex',
                        flexDirection: 'column',

                        overflowX: 'hidden',
                    }}
                >
                    <Box
                        key={location.pathname}
                        sx={{
                            flex: 1,
                            minWidth: 0,
                            width: '100%',
                            boxSizing: 'border-box',
                            p: { xs: 1.5, sm: 2, md: 4 },

                            animation: 'pageEnter 260ms ease-out',

                            '@keyframes pageEnter': {
                                from: {
                                    opacity: 0,
                                    transform: 'translateY(6px)',
                                },
                                to: {
                                    opacity: 1,
                                    transform: 'translateY(0)',
                                },
                            },
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