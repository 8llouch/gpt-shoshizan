import { setActivePinia, createPinia } from 'pinia'
import { describe, it, expect, beforeEach } from 'vitest'
import { useModelStore } from './modelStore'

beforeEach(() => {
  setActivePinia(createPinia())
})

describe('modelStore', () => {
  it('initial state is correct', () => {
    const store = useModelStore()
    expect(store.selectedModel).toBeNull()
    expect(store.models).toEqual([])
  })

  it('setSelectedModel updates model', () => {
    const store = useModelStore()
    store.setSelectedModel('test-model')
    expect(store.selectedModel).toBe('test-model')
  })

  it('reset sets model to first available', () => {
    const store = useModelStore()
    store.models = [{ name: 'Test Model', model: 'test:latest' }]
    store.setSelectedModel('other')
    store.reset()
    expect(store.selectedModel).toBe('test:latest')
  })

  it('selectedModel computed returns current value', () => {
    const store = useModelStore()
    expect(store.selectedModel).toBeNull()
    store.setSelectedModel('foo')
    expect(store.selectedModel).toBe('foo')
  })

  it('selectedModelName computed', () => {
    const store = useModelStore()
    expect(store.selectedModelName).toBe('')
    store.setSelectedModel('test-model')
    expect(store.selectedModelName).toBe('test-model')
    store.models = [{ name: 'Test Model', model: 'test-model' }]
    expect(store.selectedModelName).toBe('Test Model')
  })
})
