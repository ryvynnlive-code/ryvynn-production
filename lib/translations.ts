// RYVYNN Bilingual Translations - EN/ES
// Dark, shadow-facing messaging - NO flowery bullshit

export const translations = {
  en: {
    // Navigation
    home: 'Home',
    pricing: 'Pricing',
    about: 'About',
    
    // Crisis Banner
    crisisBanner: 'In Crisis? Call 988 - Free, Confidential, 24/7',
    
    // Homepage Hero
    tagline: 'From Our Darkest Hours to Our Brightest Days',
    heroSubtitle: 'Face your shadows. Transform your darkness. Own your story.',
    heroDescription: 'Anonymous AI-powered mental wellness for those who face their demons head-on. Zero surveillance. Always free in crisis.',
    
    // Core Features
    featuresTitle: 'Built for the Shadows',
    feature1Title: 'Zero Surveillance',
    feature1Desc: 'Your darkness stays yours. Structurally private - we can\'t see your confessions even if we wanted to.',
    feature2Title: 'Crisis Detection',
    feature2Desc: 'AI Guardian watches for warning signs. Free crisis intervention, always. No account needed.',
    feature3Title: 'Shadow Work',
    feature3Desc: 'Transform raw confessions into insights. Face what haunts you with AI that doesn\'t judge.',
    
    // Pricing
    pricingTitle: 'Choose Your Path',
    pricingSubtitle: 'Crisis access is always free. Premium features fund the mission.',
    perMonth: '/mo',
    oneTime: ' once',
    firstMonth: 'first month',
    then: 'then',
    cancelAnytime: 'cancel anytime',
    
    // CTA Buttons
    startFree: 'Start Free',
    upgrade: 'Upgrade',
    ignite: 'Ignite',
    
    // Footer
    missionStatement: 'Target: 10 Million Lives Saved by 2030',
    companyInfo: 'By AONIXX / NEXXT GEN INNOVATIONS LLC',
    
    // Language Toggle
    language: 'Language',
    switchToSpanish: 'Español',
    switchToEnglish: 'English',
  },
  
  es: {
    // Navigation
    home: 'Inicio',
    pricing: 'Precios',
    about: 'Acerca',
    
    // Crisis Banner
    crisisBanner: 'En Crisis? Llame 988 - Gratis, Confidencial, 24/7',
    
    // Homepage Hero
    tagline: 'De Nuestras Horas Más Oscuras a Nuestros Días Más Brillantes',
    heroSubtitle: 'Enfrenta tus sombras. Transforma tu oscuridad. Posee tu historia.',
    heroDescription: 'Bienestar mental anónimo impulsado por IA para aquellos que enfrentan sus demonios de frente. Cero vigilancia. Siempre gratis en crisis.',
    
    // Core Features
    featuresTitle: 'Construido para las Sombras',
    feature1Title: 'Cero Vigilancia',
    feature1Desc: 'Tu oscuridad sigue siendo tuya. Privacidad estructural - no podemos ver tus confesiones aunque quisiéramos.',
    feature2Title: 'Detección de Crisis',
    feature2Desc: 'Guardián IA vigila señales de advertencia. Intervención de crisis gratuita, siempre. Sin cuenta necesaria.',
    feature3Title: 'Trabajo con Sombras',
    feature3Desc: 'Transforma confesiones crudas en percepciones. Enfrenta lo que te persigue con IA que no juzga.',
    
    // Pricing
    pricingTitle: 'Elige Tu Camino',
    pricingSubtitle: 'Acceso de crisis siempre gratis. Funciones premium financian la misión.',
    perMonth: '/mes',
    oneTime: ' una vez',
    firstMonth: 'primer mes',
    then: 'luego',
    cancelAnytime: 'cancelar en cualquier momento',
    
    // CTA Buttons
    startFree: 'Comenzar Gratis',
    upgrade: 'Mejorar',
    ignite: 'Encender',
    
    // Footer
    missionStatement: 'Objetivo: 10 Millones de Vidas Salvadas para 2030',
    companyInfo: 'Por AONIXX / NEXXT GEN INNOVATIONS LLC',
    
    // Language Toggle
    language: 'Idioma',
    switchToSpanish: 'Español',
    switchToEnglish: 'English',
  },
} as const;

export type Language = keyof typeof translations;
export type TranslationKey = keyof typeof translations.en;
