import { useReducer, useRef, useEffect, useLayoutEffect } from 'react'
import createImpl__default from './vanilla'
export * from './vanilla'

const useIsoLayoutEffect =
  typeof window === 'undefined' ? useEffect : useLayoutEffect
function create(createState) {
  const api =
    typeof createState === 'function'
      ? createImpl__default(createState)
      : createState
  const useStore = (selector = api.getState, equalityFn = Object.is) => {
    const [, forceUpdate] = useReducer((c) => c + 1, 0)
    const state = api.getState()
    const stateRef = useRef(state)
    const selectorRef = useRef(selector)
    const equalityFnRef = useRef(equalityFn)
    const erroredRef = useRef(false)
    const currentSliceRef = useRef()
    if (currentSliceRef.current === void 0) {
      currentSliceRef.current = selector(state)
    }
    let newStateSlice
    let hasNewStateSlice = false
    if (
      stateRef.current !== state ||
      selectorRef.current !== selector ||
      equalityFnRef.current !== equalityFn ||
      erroredRef.current
    ) {
      newStateSlice = selector(state)
      hasNewStateSlice = !equalityFn(currentSliceRef.current, newStateSlice)
    }
    useIsoLayoutEffect(() => {
      if (hasNewStateSlice) {
        currentSliceRef.current = newStateSlice
      }
      stateRef.current = state
      selectorRef.current = selector
      equalityFnRef.current = equalityFn
      erroredRef.current = false
    })
    const stateBeforeSubscriptionRef = useRef(state)
    useIsoLayoutEffect(() => {
      const listener = () => {
        try {
          const nextState = api.getState()
          const nextStateSlice = selectorRef.current(nextState)
          if (!equalityFnRef.current(currentSliceRef.current, nextStateSlice)) {
            stateRef.current = nextState
            currentSliceRef.current = nextStateSlice
            forceUpdate()
          }
        } catch (error) {
          erroredRef.current = true
          forceUpdate()
        }
      }
      const unsubscribe = api.subscribe(listener)
      if (api.getState() !== stateBeforeSubscriptionRef.current) {
        listener()
      }
      return unsubscribe
    }, [])
    return hasNewStateSlice ? newStateSlice : currentSliceRef.current
  }
  Object.assign(useStore, api)
  useStore[Symbol.iterator] = function* () {
    console.warn(
      '[useStore, api] = create() is deprecated and will be removed in v4'
    )
    yield useStore
    yield api
  }
  return useStore
}

export default create
