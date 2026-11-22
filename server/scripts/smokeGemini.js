import { generateWellnessGuide } from '../src/gemini.js'

try {
  const guide = await generateWellnessGuide('For an adult with mild cold symptoms, what gentle comfort ideas may help? Avoid diagnosis and medication advice.')
  console.log(JSON.stringify({
    ok: true,
    model: guide.modelVersion,
    remedies: guide.remedies.length,
    yogaPractices: guide.yoga.length,
    summaryCharacters: guide.summary.length,
  }))
} catch (error) {
  const safeMessage = String(error?.message || 'Gemini request failed')
    .replace(/AIza[0-9A-Za-z_-]{20,}/g, '[redacted-key]')
    .replace(/sb_(?:secret|publishable)_[0-9A-Za-z_-]+/g, '[redacted-key]')
    .slice(0, 500)
  console.error(JSON.stringify({ ok: false, error: error?.name || 'GeminiRequestError', status: error?.status || error?.statusCode || null, detail: safeMessage }))
  process.exitCode = 1
}
