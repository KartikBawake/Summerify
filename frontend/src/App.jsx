import { useRef, useState } from 'react'

const sampleText = `Education equips people with knowledge, skills, and habits that help them participate in society. Schools provide a structured place to learn to read, write, communicate, and solve problems, but education also happens through families, communities, and work. Access to quality education can widen opportunity, support health, and strengthen local economies. It also helps people evaluate information, collaborate with others, and make informed choices. Because learning continues throughout life, effective education should encourage curiosity and give learners practical ways to apply what they know.`

const wordCount = (value) => value.trim() ? value.trim().split(/\s+/).length : 0

async function requestJson(url, options) {
  const response = await fetch(url, options)
  const body = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(body.error || 'Something went wrong. Please try again.')
  return body
}

export default function App() {
  const [text, setText] = useState('')
  const [summary, setSummary] = useState('')
  const [ratio, setRatio] = useState(0.6)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')
  const fileInput = useRef(null)

  const summarize = async (event) => {
    event.preventDefault()
    setNotice('')
    setBusy(true)
    try {
      const data = await requestJson('/api/summaries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, ratio: Number(ratio) })
      })
      setSummary(data.summary)
    } catch (error) {
      setNotice(error.message)
    } finally {
      setBusy(false)
    }
  }

  const uploadPdf = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    setNotice('')
    setBusy(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const data = await requestJson('/api/documents/extract', { method: 'POST', body: formData })
      setText(data.text)
      setSummary('')
      setNotice(`Extracted ${wordCount(data.text)} words from ${file.name}.`)
    } catch (error) {
      setNotice(error.message)
    } finally {
      setBusy(false)
      event.target.value = ''
    }
  }

  const clear = () => {
    setText('')
    setSummary('')
    setNotice('')
  }

  return (
    <main>
      <header className="hero">
        <p className="eyebrow">Summerify</p>
        <h1>Make long reads lighter.</h1>
        <p className="lede">Turn text or selectable-text PDFs into a concise summary in seconds.</p>
      </header>

      <section className="workspace" aria-label="Summarizer">
        <form onSubmit={summarize}>
          <div className="editor-grid">
            <label className="editor">
              <span>Source text <small>{wordCount(text)} words</small></span>
              <textarea
                value={text}
                onChange={(event) => setText(event.target.value)}
                placeholder="Paste an article, report, or notes here…"
                aria-describedby="text-help"
              />
              <span id="text-help" className="sr-only">At least 40 words are required.</span>
              <div className="editor-actions">
                <button type="button" className="text-button" onClick={() => setText(sampleText)}>Use sample</button>
                <button type="button" className="text-button" onClick={() => fileInput.current?.click()} disabled={busy}>Upload PDF</button>
                <input ref={fileInput} type="file" accept="application/pdf,.pdf" onChange={uploadPdf} hidden />
              </div>
            </label>

            <label className="editor">
              <span>Summary <small>{wordCount(summary)} words</small></span>
              <textarea value={summary} readOnly placeholder="Your summary will appear here." />
              <div className="editor-actions">
                <button type="button" className="text-button" onClick={() => setSummary('')} disabled={!summary}>Clear summary</button>
              </div>
            </label>
          </div>

          <div className="controls">
            <label className="length-control">
              <span>Summary length: <strong>{ratio === 0.4 ? 'Short' : ratio === 0.6 ? 'Medium' : 'Long'}</strong></span>
              <input type="range" min="0.4" max="0.8" step="0.2" value={ratio} onChange={(event) => setRatio(Number(event.target.value))} />
              <div><span>Short</span><span>Medium</span><span>Long</span></div>
            </label>
            <div className="primary-actions">
              <button type="button" className="secondary" onClick={clear} disabled={busy || (!text && !summary)}>Clear all</button>
              <button type="submit" className="primary" disabled={busy || !text.trim()}>{busy ? 'Working…' : 'Summarize'}</button>
            </div>
          </div>
        </form>
        {notice && <p className="notice" role="status">{notice}</p>}
      </section>

      <section className="features" aria-label="Features">
        <article><h2>Focused</h2><p>Choose a concise, balanced, or fuller summary to fit the moment.</p></article>
        <article><h2>PDF-ready</h2><p>Extract text directly from non-password-protected PDFs up to 10 MB.</p></article>
        <article><h2>Private by design</h2><p>PDFs are processed in memory and are never stored by this application.</p></article>
      </section>
    </main>
  )
}
