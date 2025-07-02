import { setActivePinia, createPinia } from 'pinia'
import { describe, it, expect, beforeEach } from 'vitest'
import { useModelStore } from './modelStore'

beforeEach(() => {
  setActivePinia(createPinia())
})

describe('modelStore', () => {
  it('initial state is correct', () => {
    const store = useModelStore()
    expect(store.selectedModel).toBe('llama3.2')
  })

  it('setSelectedModel updates model', () => {
    const store = useModelStore()
    store.setSelectedModel('test-model')
    expect(store.selectedModel).toBe('test-model')
  })

  it('reset sets model to default', () => {
    const store = useModelStore()
    store.setSelectedModel('other')
    store.reset()
    expect(store.selectedModel).toBe('llama3.2')
  })

  it('getSelectedModel computed', () => {
    const store = useModelStore()
    expect(store.getSelectedModel).toBe('llama3.2')
    store.setSelectedModel('foo')
    expect(store.getSelectedModel).toBe('foo')
  })

  it('selectedModelName computed', () => {
    const store = useModelStore()
    expect(typeof store.selectedModelName).toBe('string')
    store.setSelectedModel('llama3.2')
    expect(store.selectedModelName).toBeDefined()
  })
})
