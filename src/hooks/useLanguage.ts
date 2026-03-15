'use client'

import { useState, useEffect } from 'react'
import { LangCode, LANGUAGES, translations, Translations } from '@/lib/i18n'

function readSaved(): LangCode {
  if (typeof window === 'undefined') return 'en'
  const v = localStorage.getItem('ss-lang') as LangCode | null
  return v && v in LANGUAGES ? v : 'en'
}

export function useLanguage() {
  const [lang, setLangState] = useState<LangCode>('en')

  useEffect(() => {
    setLangState(readSaved())

    const handler = (e: CustomEvent<{ lang: LangCode }>) => setLangState(e.detail.lang)
    window.addEventListener('ss-lang-change', handler as EventListener)
    return () => window.removeEventListener('ss-lang-change', handler as EventListener)
  }, [])

  const setLang = (next: LangCode) => {
    localStorage.setItem('ss-lang', next)
    setLangState(next)
    window.dispatchEvent(new CustomEvent('ss-lang-change', { detail: { lang: next } }))
  }

  const meta = LANGUAGES[lang]

  return {
    lang,
    setLang,
    t: translations[lang] as Translations,
    dir: meta.dir as 'ltr' | 'rtl',
    speechLang: meta.speechLang,
    locale: meta.locale,
  }
}
