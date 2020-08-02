---
category: React API
order: 1
title: React Element
---

React Element是由React.createElement()创建出来的元素，是React的核心API。我们现在从React源码开始。

```js
import ReactVersion from 'shared/ReactVersion';
import {
  REACT_FRAGMENT_TYPE,
  REACT_DEBUG_TRACING_MODE_TYPE,
  REACT_PROFILER_TYPE,
  REACT_STRICT_MODE_TYPE,
  REACT_SUSPENSE_TYPE,
  REACT_SUSPENSE_LIST_TYPE,
  REACT_LEGACY_HIDDEN_TYPE,
  REACT_SCOPE_TYPE,
} from 'shared/ReactSymbols';

import {Component, PureComponent} from './ReactBaseClasses';
import {createRef} from './ReactCreateRef';
import {forEach, map, count, toArray, only} from './ReactChildren';
// 我们在这里看到三个创建element的方法和一个确认元素是否合法的方法定义子ReactElement文件中。
import {
  createElement as createElementProd,
  createFactory as createFactoryProd,
  cloneElement as cloneElementProd,
  isValidElement,
} from './ReactElement';
import {createContext} from './ReactContext';
import {lazy} from './ReactLazy';
import {forwardRef} from './ReactForwardRef';
import {memo} from './ReactMemo';
import {block} from './ReactBlock';
import {
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useDebugValue,
  useLayoutEffect,
  useMemo,
  useMutableSource,
  useReducer,
  useRef,
  useState,
  useResponder,
  useTransition,
  useDeferredValue,
  useOpaqueIdentifier,
} from './ReactHooks';

import {withSuspenseConfig} from './ReactBatchConfig';
import {
  createElementWithValidation,
  createFactoryWithValidation,
  cloneElementWithValidation,
} from './ReactElementValidator';
import {createMutableSource} from './ReactMutableSource';
import ReactSharedInternals from './ReactSharedInternals';
import {createFundamental} from './ReactFundamental';
import {createEventResponder} from './ReactEventResponder';

// TODO: Move this branching into the other module instead and just re-export.
const createElement = __DEV__ ? createElementWithValidation : createElementProd;
const cloneElement = __DEV__ ? cloneElementWithValidation : cloneElementProd;
const createFactory = __DEV__ ? createFactoryWithValidation : createFactoryProd;

const Children = {
  map,
  forEach,
  count,
  toArray,
  only,
};
// 在这里的export的对象就是React对象，下面的这些属性都是React暴露给开发者所使用的
// API
export {
  Children,
  createMutableSource,
  createRef,
  Component,
  PureComponent,
  createContext,
  forwardRef,
  lazy,
  memo,
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useDebugValue,
  useLayoutEffect,
  useMemo,
  useMutableSource,
  useReducer,
  useRef,
  useState,
  REACT_FRAGMENT_TYPE as Fragment,
  REACT_PROFILER_TYPE as Profiler,
  REACT_STRICT_MODE_TYPE as StrictMode,
  REACT_DEBUG_TRACING_MODE_TYPE as unstable_DebugTracingMode,
  REACT_SUSPENSE_TYPE as Suspense,
  createElement,
  cloneElement,
  isValidElement,
  ReactVersion as version,
  ReactSharedInternals as __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,
  // Deprecated behind disableCreateFactory
  createFactory,
  // Concurrent Mode
  useTransition,
  useDeferredValue,
  REACT_SUSPENSE_LIST_TYPE as SuspenseList,
  REACT_LEGACY_HIDDEN_TYPE as unstable_LegacyHidden,
  withSuspenseConfig as unstable_withSuspenseConfig,
  // enableBlocksAPI
  block,
  // enableDeprecatedFlareAPI
  useResponder as DEPRECATED_useResponder,
  createEventResponder as DEPRECATED_createResponder,
  // enableFundamentalAPI
  createFundamental as unstable_createFundamental,
  // enableScopeAPI
  REACT_SCOPE_TYPE as unstable_Scope,
  useOpaqueIdentifier as unstable_useOpaqueIdentifier,
};

```