import {
    createContext,
    useContext,
    useState,
    type ReactNode,
} from 'react'

export type Language = 'tr' | 'en'

type LanguageContextType = {
    language: Language
    setLanguage: (language: Language) => void
}

const LanguageContext =
    createContext<LanguageContextType | undefined>(
        undefined
    )

type LanguageProviderProps = {
    children: ReactNode
}

export function LanguageProvider({
    children,
}: LanguageProviderProps) {
    const [language, setLanguageState] =
        useState<Language>(() => {
            const savedLanguage =
                localStorage.getItem('language')

            return savedLanguage === 'en'
                ? 'en'
                : 'tr'
        })

    const setLanguage = (language: Language) => {
        setLanguageState(language)
        localStorage.setItem(
            'language',
            language
        )
    }

    return (
        <LanguageContext.Provider
            value={{
                language,
                setLanguage,
            }}
        >
            {children}
        </LanguageContext.Provider>
    )
}

export function useLanguage() {
    const context =
        useContext(LanguageContext)

    if (!context) {
        throw new Error(
            'useLanguage must be used inside LanguageProvider'
        )
    }

    return context
}