'use strict'

Object.defineProperty(exports, '__esModule', { value: true })

var _regeneratorRuntime = require('@babel/runtime/regenerator')
var react = require('react')
var createImpl = require('./vanilla')

function _interopDefaultLegacy(e) {
  return e && typeof e === 'object' && 'default' in e ? e : { default: e }
}

var _regeneratorRuntime__default = /*#__PURE__*/ _interopDefaultLegacy(
  _regeneratorRuntime
)
var createImpl__default = /*#__PURE__*/ _interopDefaultLegacy(createImpl)

var useIsoLayoutEffect =
  typeof window === 'undefined' ? react.useEffect : react.useLayoutEffect
function create(createState) {
  var api =
    typeof createState === 'function'
      ? createImpl__default['default'](createState)
      : createState

  var useStore = function useStore(selector, equalityFn) {
    if (selector === void 0) {
      selector = api.getState
    }

    if (equalityFn === void 0) {
      equalityFn = Object.is
    }

    var _ref = react.useReducer(function (c) {
        return c + 1
      }, 0),
      forceUpdate = _ref[1]

    var state = api.getState()
    var stateRef = react.useRef(state)
    var selectorRef = react.useRef(selector)
    var equalityFnRef = react.useRef(equalityFn)
    var erroredRef = react.useRef(false)
    var currentSliceRef = react.useRef()

    if (currentSliceRef.current === undefined) {
      currentSliceRef.current = selector(state)
    }

    var newStateSlice
    var hasNewStateSlice = false // The selector or equalityFn need to be called during the render phase if
    // they change. We also want legitimate errors to be visible so we re-run
    // them if they errored in the subscriber.

    if (
      stateRef.current !== state ||
      selectorRef.current !== selector ||
      equalityFnRef.current !== equalityFn ||
      erroredRef.current
    ) {
      // Using local variables to avoid mutations in the render phase.
      newStateSlice = selector(state)
      hasNewStateSlice = !equalityFn(currentSliceRef.current, newStateSlice)
    } // Syncing changes in useEffect.

    useIsoLayoutEffect(function () {
      if (hasNewStateSlice) {
        currentSliceRef.current = newStateSlice
      }

      stateRef.current = state
      selectorRef.current = selector
      equalityFnRef.current = equalityFn
      erroredRef.current = false
    })
    var stateBeforeSubscriptionRef = react.useRef(state)
    useIsoLayoutEffect(function () {
      var listener = function listener() {
        try {
          var nextState = api.getState()
          var nextStateSlice = selectorRef.current(nextState)

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

      var unsubscribe = api.subscribe(listener)

      if (api.getState() !== stateBeforeSubscriptionRef.current) {
        listener() // state has changed before subscription
      }

      return unsubscribe
    }, [])
    return hasNewStateSlice ? newStateSlice : currentSliceRef.current
  }

  Object.assign(useStore, api) // For backward compatibility (No TS types for this)

  useStore[Symbol.iterator] = /*#__PURE__*/ _regeneratorRuntime__default[
    'default'
  ].mark(function _callee() {
    return _regeneratorRuntime__default['default'].wrap(function _callee$(
      _context
    ) {
      while (1) {
        switch ((_context.prev = _context.next)) {
          case 0:
            console.warn(
              '[useStore, api] = create() is deprecated and will be removed in v4'
            )
            _context.next = 3
            return useStore

          case 3:
            _context.next = 5
            return api

          case 5:
          case 'end':
            return _context.stop()
        }
      }
    },
    _callee)
  })
  return useStore
}

exports.default = create
Object.keys(createImpl).forEach(function (k) {
  if (k !== 'default' && !exports.hasOwnProperty(k))
    Object.defineProperty(exports, k, {
      enumerable: true,
      get: function () {
        return createImpl[k]
      },
    })
})
