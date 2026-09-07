import { useState } from 'react'
import { Box } from '@mui/material'
import { Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import Sidebar from '../shared/components/Sidebar'

type MainLayoutProps = {
    mode: 'light' | 'dark'
    setMode: React.Dispatch<React.SetStateAction<'light' | 'dark'>>
}

export default function MainLayout({
    mode,
    setMode,
}: MainLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false)

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            <Header
                mode={mode}
                setMode={setMode}
                sidebarOpen={sidebarOpen}
                onToggleSidebar={() =>
                    setSidebarOpen((p) => !p)
                }
            />

            <Box
                sx={{
                    display: 'flex',
                    flex: 1,
                }}
            >
                <Sidebar
                    open={sidebarOpen}
                    onHoverChange={setSidebarOpen}
                />

                {sidebarOpen && (
                    <Box
                        onClick={() => setSidebarOpen(false)}
                        sx={{
                            position: 'fixed',
                            top: 64,
                            left: 76,
                            right: 0,
                            bottom: 0,
                            zIndex: (theme) =>
                                theme.zIndex.drawer + 1,
                        }}
                    />
                )}

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