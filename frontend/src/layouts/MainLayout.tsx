import React from 'react'
import { Box } from '@mui/material'
import { Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'

type MainLayoutProps = {
    mode: 'light' | 'dark'
    setMode: React.Dispatch<React.SetStateAction<'light' | 'dark'>>
}

export default function MainLayout({ mode, setMode }: MainLayoutProps) {
    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            <Header mode={mode} setMode={setMode} />

            <Box component="main" sx={{ flex: 1 }}>
                <Outlet />
            </Box>

            <Footer />
        </Box>
    )
}