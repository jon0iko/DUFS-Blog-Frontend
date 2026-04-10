/**
 * Font utility functions for language-specific styling
 * Bengali text uses Kalpurush font (--font-kalpurush)
 * English text uses Roboto font (--font-roboto)
 */

/**
 * Detect if text contains Bengali characters
 */
export const isBengaliText = (text: string): boolean => {
  if (!text) return false
  // Bengali Unicode range: U+0980 to U+09FF
  const bengaliRegex = /[\u0980-\u09FF]/g
  return bengaliRegex.test(text)
}

/**
 * Detect if text contains both Bengali and English letters
 */
export const isMixedBengaliEnglishText = (text: string): boolean => {
  if (!text) return false
  const hasBengali = /[\u0980-\u09FF]/.test(text)
  const hasEnglish = /[A-Za-z]/.test(text)
  return hasBengali && hasEnglish
}


/**
 * Detect if text is Bengali-only (no English letters)
 */
export const isPureBengaliText = (text: string): boolean => {
  if (!text) return false
  return isBengaliText(text) && !/[A-Za-z]/.test(text)
}

export const getfontsizeBN = (text: string, classname: string) => {
  if (isPureBengaliText(text)) {
    if (classname === "text-base") {
      return "text-lg";
    }
    else if (classname === "text-xs") {
      return "text-sm";
    }
    else if (classname === "text-sm") {
      return "text-base";
    }
    else if (classname === "text-xl") {
      return "text-2xl";
    }
    else if (classname === "text-2xl") {
      return "text-3xl";
    }
    else if (classname === "text-3xl") {
      return "text-4xl";
    }
    else {
      return classname;
    }
  }
  else {
    return classname;
  }
}


/**
 * Get appropriate font class for text
 */
export const getFontClass = (text: string): string => {
  return isPureBengaliText(text) ? 'font-kalpurush' : 'font-montserrat'
}

export const getFontClassRoboto = (text: string): string => { 
  return isPureBengaliText(text) ? 'font-kalpurush' : 'font-roboto'
}

export const getFontClassZillaSlab = (text: string): string => {
  return isPureBengaliText(text) ? 'font-kalpurush' : 'font-zillaslab'
}

export const getFontClassAlteHaasGrotesk = (text: string): string => {
  return isPureBengaliText(text) ? 'font-kalpurush' : 'font-altehaasgrotesk'
}

export const getFontClassMono = (text: string): string => {
  return isPureBengaliText(text) ? 'font-kalpurush' : 'font-mono'
}
/**
 * Split text into Bengali and English segments for mixed content
 */
export const splitMixedText = (text: string): Array<{ text: string; isBengali: boolean }> => {
  if (!text) return []

  const bengaliRegex = /[\u0980-\u09FF]+/g
  const segments: Array<{ text: string; isBengali: boolean }> = []
  let lastIndex = 0
  let match

  if (!bengaliRegex.test(text)) {
    // No Bengali text found
    return [{ text, isBengali: false }]
  }

  // Reset regex for iteration
  bengaliRegex.lastIndex = 0
  while ((match = bengaliRegex.exec(text)) !== null) {
    // Add English segment before Bengali
    if (match.index > lastIndex) {
      segments.push({
        text: text.substring(lastIndex, match.index),
        isBengali: false,
      })
    }

    // Add Bengali segment
    segments.push({
      text: match[0],
      isBengali: true,
    })

    lastIndex = match.index + match[0].length
  }

  // Add remaining English text
  if (lastIndex < text.length) {
    segments.push({
      text: text.substring(lastIndex),
      isBengali: false,
    })
  }

  return segments
}
