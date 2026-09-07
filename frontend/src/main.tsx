import { StrictMode, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider, CssBaseline } from '@mui/material'
import { BrowserRouter } from 'react-router-dom'
import { createAppTheme } from './app/theme'
import App from './App'

function Root() {
    const [mode, setMode] = useState<'light' | 'dark'>('light')

    const theme = useMemo(() => createAppTheme(mode), [mode])

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <BrowserRouter>
                <App mode={mode} setMode={setMode} />
            </BrowserRouter>
        </ThemeProvider>
    )
}

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <Root />
    </StrictMode>,
)