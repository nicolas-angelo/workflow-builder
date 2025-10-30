import { Geist } from 'next/font/google'
import { JetBrains_Mono } from 'next/font/google'

export const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  preload: true,
})

export const jetBrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
  preload: true,
})

const fontMap = {
  geistSans: geistSans,
  jetBrainsMono: jetBrainsMono,
}

export default function fonts(fonts: (keyof typeof fontMap)[]) {
  return fonts.map(font => fontMap[font].variable).join(' ')
}
