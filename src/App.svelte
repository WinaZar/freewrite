<script lang="ts">
  import { onMount } from 'svelte'
  import { chime, unlockAudio } from './lib/chime'
  import {
    PRESET_MINUTES,
    blank,
    burn,
    extend,
    formatClock,
    phase,
    shouldChime,
    start,
    type State,
  } from './lib/session'

  const MIN = 60_000
  const DEFAULT_MINUTES = 10
  const BURN_FADE_MS = 1000
  // The selected preset is the only thing the app persists (docs/adr/0001).
  const PRESET_KEY = 'freewrite.durationMinutes'

  const saved = Number(localStorage.getItem(PRESET_KEY))
  const initialMinutes = PRESET_MINUTES.some((m) => m === saved) ? saved : DEFAULT_MINUTES

  let minutes = $state(initialMinutes)
  let session = $state<State>(blank(initialMinutes * MIN))
  let text = $state('')
  let now = $state(Date.now())
  let burning = $state(false)
  let editor: HTMLTextAreaElement

  const current = $derived(phase(session, now))
  const clock = $derived(formatClock(session, now))

  onMount(() => {
    editor.focus()
    const id = setInterval(() => {
      const t = Date.now()
      if (shouldChime(phase(session, now), phase(session, t))) chime()
      now = t
    }, 250)
    return () => clearInterval(id)
  })

  function selectPreset(m: number) {
    minutes = m
    localStorage.setItem(PRESET_KEY, String(m))
    session = blank(m * MIN)
  }

  function onInput() {
    if (session.kind === 'blank' && editor.value.length > 0) {
      unlockAudio()
      now = Date.now()
      session = start(session, now)
    }
  }

  function onExtend() {
    now = Date.now()
    session = extend(session, now)
  }

  function onBurn() {
    session = burn(session)
    burning = true
    setTimeout(() => {
      text = ''
      burning = false
      editor.focus()
    }, BURN_FADE_MS)
  }

  function onKeydown(e: KeyboardEvent) {
    if (!e.metaKey || session.kind !== 'session') return
    if (e.key === 'Enter') {
      e.preventDefault()
      onBurn()
    } else if (e.key === '=' || e.key === '+') {
      e.preventDefault()
      onExtend()
    }
  }

  // Clicking a HUD button must not steal focus from the page.
  const keepFocus = (e: MouseEvent) => e.preventDefault()
</script>

<svelte:window onkeydown={onKeydown} />

<div class="titlebar" data-tauri-drag-region></div>

<div class="hud" class:overtime={current === 'overtime'}>
  {#if session.kind === 'blank'}
    {#each PRESET_MINUTES as m}
      <button class:selected={m === minutes} onmousedown={keepFocus} onclick={() => selectPreset(m)}>
        {m}
      </button>
    {/each}
    <span class="unit">min</span>
  {:else}
    <span class="clock">{clock}</span>
    <button onmousedown={keepFocus} onclick={onExtend} title="⌘+">Extend</button>
    <button onmousedown={keepFocus} onclick={onBurn} title="⌘↩">Burn</button>
  {/if}
</div>

<textarea
  bind:this={editor}
  bind:value={text}
  class:burning
  readonly={burning}
  oninput={onInput}
  spellcheck="false"
  autocomplete="off"
  autocorrect="off"
  autocapitalize="off"
  aria-label="Page"
></textarea>

<style>
  .titlebar {
    position: fixed;
    inset: 0 0 auto 0;
    height: 32px;
  }

  .hud {
    position: fixed;
    top: 9px;
    right: 18px;
    z-index: 1;
    display: flex;
    align-items: baseline;
    gap: 0.8rem;
    font-size: 13px;
    font-variant-numeric: tabular-nums;
    color: var(--muted);
    user-select: none;
    -webkit-user-select: none;
  }

  button {
    appearance: none;
    border: 0;
    padding: 0;
    background: none;
    font: inherit;
    color: inherit;
    cursor: default;
    opacity: 0.45;
    transition: opacity 0.2s;
  }

  .hud:hover button {
    opacity: 0.8;
  }

  button:hover,
  button.selected {
    opacity: 1;
    color: var(--text);
  }

  .unit {
    opacity: 0.45;
  }

  .clock {
    color: var(--text);
    opacity: 0.6;
  }

  .overtime .clock {
    color: var(--ember);
    opacity: 1;
  }

  textarea {
    display: block;
    width: 100%;
    height: 100%;
    padding: 72px max(2rem, calc((100% - 65ch) / 2)) 30vh;
    border: 0;
    outline: 0;
    resize: none;
    background: transparent;
    color: inherit;
    font: inherit;
    font-size: 19px;
    line-height: 1.65;
    caret-color: var(--ember);
  }

  textarea.burning {
    opacity: 0;
    filter: blur(6px);
    transition:
      opacity 1s ease-in,
      filter 1s ease-in;
  }
</style>
