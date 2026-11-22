import gingerImg from '../assets/remedy-ginger-tea.jpg'
import tulsiImg from '../assets/remedy-tulsi.jpg'
import compressImg from '../assets/remedy-cold-compress.jpg'
import childPoseImg from '../assets/yoga-child-pose.jpg'
import neckStretchImg from '../assets/yoga-neck-stretch.jpg'
import pranayamaImg from '../assets/yoga-pranayama.jpg'

// Local fallbacks indexed by keywords
const REMEDY_FALLBACKS = [
  {
    keywords: ['ginger', 'adrak', 'lemon', 'honey', 'citrus', 'tea', 'kadha'],
    src: gingerImg,
  },
  {
    keywords: ['tulsi', 'basil', 'herb', 'herbal', 'leaf', 'leaves', 'decoction'],
    src: tulsiImg,
  },
  {
    keywords: ['compress', 'cold', 'ice', 'cloth', 'towel', 'cool', 'rest', 'pack'],
    src: compressImg,
  },
]

const YOGA_FALLBACKS = [
  {
    keywords: ['child', 'balasana', 'fold', 'restorative', 'rest'],
    src: childPoseImg,
  },
  {
    keywords: ['neck', 'shoulder', 'head', 'roll', 'tilt', 'stretch'],
    src: neckStretchImg,
  },
  {
    keywords: ['breath', 'pranayama', 'seated', 'meditation', 'padmasana', 'sukhasana'],
    src: pranayamaImg,
  },
]

export function getLocalRemedyFallback(title = '', index = 0) {
  const lower = (title || '').toLowerCase()
  for (const entry of REMEDY_FALLBACKS) {
    if (entry.keywords.some((k) => lower.includes(k))) {
      return entry.src
    }
  }
  const defaults = [gingerImg, tulsiImg, compressImg]
  return defaults[index % defaults.length]
}

export function getLocalYogaFallback(title = '', index = 0) {
  const lower = (title || '').toLowerCase()
  for (const entry of YOGA_FALLBACKS) {
    if (entry.keywords.some((k) => lower.includes(k))) {
      return entry.src
    }
  }
  const defaults = [childPoseImg, neckStretchImg, pranayamaImg]
  return defaults[index % defaults.length]
}

/**
 * Generates a dynamic Bing image thumbnail URL related specifically to the remedy title & condition.
 */
export function getRemedyImage(title = '', index = 0, query = '') {
  const cleanTitle = (title || '').trim()
  if (cleanTitle) {
    const searchTerms = [cleanTitle, query, 'ayurvedic natural remedy']
      .filter(Boolean)
      .join(' ')
    return `https://tse1.mm.bing.net/th?q=${encodeURIComponent(searchTerms)}&w=480&h=300&c=7&rs=1&p=0`
  }
  return getLocalRemedyFallback(title, index)
}

/**
 * Generates a dynamic Bing image thumbnail URL related specifically to the yoga pose & condition.
 */
export function getYogaImage(title = '', index = 0, query = '') {
  const cleanTitle = (title || '').trim()
  if (cleanTitle) {
    const searchTerms = [cleanTitle, query, 'yoga pose guidance']
      .filter(Boolean)
      .join(' ')
    return `https://tse1.mm.bing.net/th?q=${encodeURIComponent(searchTerms)}&w=480&h=300&c=7&rs=1&p=0`
  }
  return getLocalYogaFallback(title, index)
}
