/**
 * @typedef {{ name: string, amount: string }} Ingredient
 * @typedef {{ title: string, ingredients: Ingredient[], steps: string[], usage: string, precautions: string[] }} Remedy
 * @typedef {{ title: string, duration: string, steps: string[], precautions: string[] }} YogaPractice
 * @typedef {{ title: string, source: string, url: string }} GuideSource
 * @typedef {{ query: string, summary: string, safetyNote: string, remedies: Remedy[], yoga: YogaPractice[], videos: Array<{title: string, channel: string, duration: string, artwork: string}>, sources: GuideSource[] }} WellnessGuide
 */

/** @type {WellnessGuide} */
export const mockWellnessGuide = {
  query: 'Common cold',
  summary: 'A cold is usually a mild viral illness that improves with time. Rest, fluids and simple comfort measures may help you feel more at ease while you recover.',
  safetyNote: 'This sample guide is general wellness information, not a diagnosis or treatment plan. Seek medical care for trouble breathing, dehydration, a fever lasting more than four days, or symptoms that last more than 10 days without improving.',
  remedies: [
    {
      title: 'Warm fluids & rest',
      ingredients: [{ name: 'Water, broth or a caffeine-free drink', amount: 'As comfortable' }],
      steps: ['Choose a warm drink you already enjoy.', 'Sip it slowly and keep water nearby.', 'Make space for rest while you recover.'],
      usage: 'Sip when thirsty; let comfort guide you.',
      precautions: ['This is for comfort and hydration; it does not cure a cold.', 'Follow any fluid limits given to you by a healthcare professional.'],
    },
    {
      title: 'Honey in a warm drink',
      ingredients: [{ name: 'Pasteurized honey', amount: 'A small spoonful' }, { name: 'Warm water or tea', amount: 'One cup' }],
      steps: ['Let the drink cool until comfortably warm.', 'Stir in the honey until it dissolves.', 'Sip slowly; do not use very hot liquids.'],
      usage: 'A soothing option for cough for adults and children aged 1 year and older.',
      precautions: ['Never give honey to a child younger than 1 year.', 'Avoid if you are allergic to honey or have been advised to limit it.'],
    },
    {
      title: 'Ready-made saline spray',
      ingredients: [{ name: 'Saline nasal spray', amount: 'Use the product label' }],
      steps: ['Wash your hands.', 'Use a commercially prepared saline spray as directed on its label.', 'Clean and store the nozzle as the product instructions describe.'],
      usage: 'Use according to the package directions for temporary nasal comfort.',
      precautions: ['Do not share the bottle.', 'Ask a healthcare professional before use if you have a relevant medical condition or are unsure.'],
    },
  ],
  yoga: [
    {
      title: 'Supported seated rest',
      duration: '2–3 minutes',
      steps: ['Sit in a stable chair with both feet supported.', 'Let your shoulders soften without forcing a stretch.', 'Keep your breath natural and rest for as long as comfortable.'],
      precautions: ['Skip practice if you feel unwell, dizzy or short of breath.', 'Stop if anything feels uncomfortable; this is not a breathing treatment.'],
    },
    {
      title: 'Gentle shoulder circles',
      duration: 'About 1 minute',
      steps: ['Sit comfortably with your back supported.', 'If it feels easy, make a few small, slow shoulder circles.', 'Pause whenever you like; there is no need to match a breath.'],
      precautions: ['Keep the movement small and pain-free.', 'Skip it during fever or if movement worsens symptoms.'],
    },
  ],
  videos: [
    { title: 'A quiet moment to settle', channel: 'Sample video card', duration: '03:20', artwork: 'video-art--sunrise' },
    { title: 'A gentle seated pause', channel: 'Sample video card', duration: '05:10', artwork: 'video-art--garden' },
  ],
  sources: [
    { title: 'Manage Common Cold', source: 'U.S. Centers for Disease Control and Prevention', url: 'https://www.cdc.gov/common-cold/treatment/' },
    { title: 'Yoga: Effectiveness and Safety', source: 'National Center for Complementary and Integrative Health', url: 'https://www.nccih.nih.gov/health/yoga-effectiveness-and-safety' },
  ],
}
