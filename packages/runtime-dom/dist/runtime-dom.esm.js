// packages/runtime-dom/src/nodeOps.ts
var nodeOps = {
  createElement(tagName) {
    return document.createElement(tagName);
  },
  createTextNode(text) {
    return document.createTextNode(text);
  },
  insert(child, parent, anchor) {
    parent.insertBefore(child, anchor);
  },
  remove(child) {
    child.parentNode?.removeChild(child);
  },
  setElementText(el, text) {
    el.textContent = text;
  }
};

// packages/runtime-dom/src/modules/patchClass.ts
var patchClass = (el, value) => {
  if (value == null) {
    el.removeAttribute("class");
  } else {
    el.className = value;
  }
};

// packages/runtime-dom/src/modules/patchStyle.ts
var patchStyle = (el, prevValue, nextValue) => {
  let style = el.style;
  if (prevValue) {
    for (let key in prevValue) {
      if (nextValue[key] == null) {
        style[key] = null;
      }
    }
  }
  if (nextValue) {
    for (let key in nextValue) {
      style[key] = nextValue[key];
    }
  }
};

// packages/runtime-dom/src/modules/patchEvent.ts
var createInvoker = (handler) => {
  const invoker = (e) => {
    invoker.value(e);
  };
  invoker.value = handler;
  return invoker;
};
var patchEvent = (el, name, handler) => {
  const invokers = el._vei || (el._vei = {});
  const eventName = name.slice(2).toLowerCase();
  const existingInvoker = invokers[eventName];
  if (handler && existingInvoker) {
    return existingInvoker.value = handler;
  }
  if (handler) {
    const invoker = invokers[name] = createInvoker(handler);
    return el.addEventListener(eventName, invoker);
  }
  if (existingInvoker) {
    el.removeEventListener(eventName, existingInvoker);
    invokers[eventName] = null;
  }
};

// packages/runtime-dom/src/modules/patchAttr.ts
var patchAttr = (el, key, value) => {
  if (value == null) {
    el.removeAttribute(key);
  } else {
    el.setAttribute(key, value);
  }
};

// packages/runtime-dom/src/patchProp.ts
function patchProp(el, key, prevValue, nextValue) {
  if (key === "class") {
    patchClass(el, nextValue);
  } else if (key === "style") {
    patchStyle(el, prevValue, nextValue);
  } else if (key.startsWith("on")) {
    patchEvent(el, key, nextValue);
  } else {
    patchAttr(el, key, nextValue);
  }
}

// packages/reactivity/src/effect.ts
var activeEffect = void 0;
function effect(fn, options) {
  const _effect = new ReactiveEffect(fn, () => {
    _effect.run();
  });
  _effect.run();
  if (options) {
    Object.assign(_effect, options);
  }
  const runner = _effect.run.bind(_effect);
  runner.effect = _effect;
  return runner;
}
var ReactiveEffect = class {
  constructor(fn, scheduler) {
    this.fn = fn;
    this.scheduler = scheduler;
    this.deps = [];
    this._depsLength = 0;
    this._trackId = 0;
    this.active = true;
    this._dirtyLevel = 4 /* Dirty */;
    this._running = 0;
  }
  get dirty() {
    return this._dirtyLevel === 4 /* Dirty */;
  }
  set dirty(value) {
    this._dirtyLevel = value ? 4 /* Dirty */ : 0 /* NoDirty */;
  }
  run() {
    this._dirtyLevel = 0 /* NoDirty */;
    if (!this.active) {
      return this.fn();
    }
    let lastEffect = activeEffect;
    try {
      activeEffect = this;
      preCleanEffect(this);
      this._running++;
      return this.fn();
    } finally {
      this._running--;
      postCleanEffect(this);
      activeEffect = lastEffect;
    }
  }
  stop() {
    if (this.active) {
      this.active = false;
      postCleanEffect(this);
      preCleanEffect(this);
    }
  }
};
function trackEffect(effect2, dep) {
  if (dep.get(effect2) !== effect2._trackId) {
    dep.set(effect2, effect2._trackId);
  }
  const oldDep = effect2.deps[effect2._depsLength];
  if (oldDep != dep) {
    if (oldDep) {
      cleanDepEffect(oldDep, effect2);
    }
    effect2.deps[effect2._depsLength++] = dep;
  } else {
    effect2._depsLength++;
  }
}
function preCleanEffect(effect2) {
  effect2._depsLength = 0;
  effect2._trackId++;
}
function postCleanEffect(effect2) {
  if (effect2.deps.length > effect2._depsLength) {
    for (let i = effect2._depsLength; i < effect2.deps.length; i++) {
      cleanDepEffect(effect2.deps[i], effect2);
    }
    effect2.deps.length = effect2._depsLength;
  }
}
function cleanDepEffect(dep, effect2) {
  dep.delete(effect2);
  if (dep.size === 0) {
    dep.cleanUp();
  }
}

// packages/shared/src/index.ts
function isObject(value) {
  return typeof value === "object" && value !== null;
}
function isFunction(value) {
  return typeof value === "function";
}

// packages/reactivity/src/reactiveEffect.ts
var targetMap = /* @__PURE__ */ new WeakMap();
function track(target, key) {
  if (!activeEffect) return;
  let depsMap = targetMap.get(target);
  if (!depsMap) {
    targetMap.set(target, depsMap = /* @__PURE__ */ new Map());
  }
  let dep = depsMap.get(key);
  if (!dep) {
    depsMap.set(
      key,
      dep = createDep(() => {
        depsMap.delete(key);
      }, key)
    );
  }
  trackEffect(activeEffect, dep);
}
function createDep(cleanUp, key) {
  let dep = /* @__PURE__ */ new Map();
  dep.cleanUp = cleanUp;
  dep.name = key;
  return dep;
}
function trigger(target, key) {
  const depsMap = targetMap.get(target);
  if (!depsMap) {
    return;
  }
  const dep = depsMap.get(key);
  if (dep) {
    triggerEffects(dep);
  }
}
function triggerEffects(dep) {
  for (const effect2 of dep.keys()) {
    if (effect2._dirtyLevel < 4 /* Dirty */) {
      effect2._dirtyLevel = 4 /* Dirty */;
    }
    if (!effect2._running) {
      if (effect2.scheduler) {
        effect2.scheduler();
      }
    }
  }
}

// packages/reactivity/src/baseHandlers.ts
var baseHandlers = {
  get(target, key, receiver) {
    if (key === "__v_isReactive" /* IS_REACTIVE */) return true;
    track(target, key);
    let result = Reflect.get(target, key, receiver);
    if (isObject(result)) {
      return reactive(result);
    }
    return result;
  },
  set(target, key, value, receiver) {
    let result = Reflect.set(target, key, value, receiver);
    trigger(target, key);
    return result;
  }
};

// packages/reactivity/src/reactive.ts
var cacheProxyMap = /* @__PURE__ */ new WeakMap();
function reactive(value) {
  if (!isObject(value)) {
    return value;
  }
  return createProxyObject(value);
}
function createProxyObject(value) {
  const existProxy = cacheProxyMap.get(value);
  if (existProxy) {
    return existProxy;
  }
  if (value["__v_isReactive" /* IS_REACTIVE */]) {
    return value;
  }
  const proxy = new Proxy(value, baseHandlers);
  cacheProxyMap.set(value, proxy);
  return proxy;
}
function toReactive(value) {
  return !isObject(value) ? value : createProxyObject(value);
}
function isReactive(value) {
  return !!(value && value["__v_isReactive" /* IS_REACTIVE */]);
}

// packages/reactivity/src/ref.ts
function ref(value) {
  return createRef(value);
}
function createRef(value) {
  return new RefImpl(value);
}
var RefImpl = class {
  constructor(rawValue) {
    this.rawValue = rawValue;
    this.__v_isRef = true;
    this._value = toReactive(rawValue);
  }
  get value() {
    trackRefValue(this);
    return this._value;
  }
  set value(newValue) {
    if (newValue !== this.rawValue) {
      this.rawValue = newValue;
      this._value = newValue;
      triggerRefValue(this);
    }
  }
};
function trackRefValue(ref2) {
  if (activeEffect) {
    trackEffect(
      activeEffect,
      ref2.dep = ref2.dep || createDep(() => ref2.dep = void 0, "undefined")
    );
  }
}
function triggerRefValue(ref2) {
  let dep = ref2.dep;
  if (dep) {
    triggerEffects(dep);
  }
}
function toRef(obj, key) {
  return new ObjectRefImpl(obj, key);
}
var ObjectRefImpl = class {
  constructor(target, key) {
    this.target = target;
    this.key = key;
    this.__v_isRef = true;
  }
  get value() {
    return this.target[this.key];
  }
  set value(newValue) {
    this.target[this.key] = newValue;
  }
};
function toRefs(obj) {
  const ret = {};
  for (const key in obj) {
    ret[key] = toRef(obj, key);
  }
  return ret;
}
function proxyRefs(target) {
  return new Proxy(target, {
    get(target2, key, receiver) {
      const original = Reflect.get(target2, key, receiver);
      return original.__v_isRef ? original.value : original;
    },
    set(target2, key, value, receiver) {
      const oldValue = target2[key];
      if (oldValue.__v_isRef) {
        oldValue.value = value;
      } else {
        return Reflect.set(target2, key, value, receiver);
      }
    }
  });
}
function isRef(value) {
  return value.__v_isRef === true;
}

// packages/reactivity/src/computed.ts
function computed(getterOrOptions) {
  let getter;
  let setter;
  if (isFunction(getterOrOptions)) {
    getter = getterOrOptions;
    setter = () => {
    };
  } else {
    getter = getterOrOptions.get;
    setter = getterOrOptions.set;
  }
  return new ComputedRefImpl(getter, setter);
}
var ComputedRefImpl = class {
  constructor(getter, setter) {
    this.getter = getter;
    this.setter = setter;
    this.effect = new ReactiveEffect(
      () => getter(this._value),
      () => {
        triggerRefValue(this);
      }
    );
  }
  get value() {
    if (this.effect.dirty) {
      this._value = this.effect.run();
      trackRefValue(this);
    }
    return this._value;
  }
  set value(newValue) {
    this.setter(newValue);
  }
};

// packages/reactivity/src/apiWatch.ts
function watch(source, cb, options) {
  return doWatch(source, cb, options);
}
function doWatch(source, cb, { deep, immediate }) {
  const reactiveGetter = (source2) => traverse(source2, deep === false ? 1 : void 0);
  let getter;
  if (isReactive(source)) {
    getter = () => reactiveGetter(source);
  } else if (isRef(source)) {
    getter = () => source.value;
  } else if (isFunction(source)) {
    getter = source;
  } else {
    getter = () => source;
  }
  let oldValue;
  const job = () => {
    if (cb) {
      const newValue = effect2.run();
      cb(newValue, oldValue);
      oldValue = newValue;
    } else {
      effect2.run();
    }
  };
  const effect2 = new ReactiveEffect(getter, job);
  if (cb) {
    if (immediate) {
      job();
    } else {
      oldValue = effect2.run();
    }
  } else {
    effect2.run();
  }
  const unwatch = () => {
    effect2.stop();
  };
  return unwatch;
}
function traverse(source, depth, currentDepth = 0, seen = /* @__PURE__ */ new Set()) {
  if (!isObject(source)) return;
  if (depth) {
    if (currentDepth >= depth) {
      return source;
    }
    currentDepth++;
  }
  if (seen.has(source)) return source;
  seen.add(source);
  for (const key in source) {
    traverse(source[key], depth, currentDepth, seen);
  }
  return source;
}
function watchEffect(source, options = {}) {
  return doWatch(source, null, options);
}

// packages/runtime-dom/src/index.ts
var renderOptions = Object.assign({ patchProp }, nodeOps);
export {
  ReactiveEffect,
  activeEffect,
  cleanDepEffect,
  computed,
  createProxyObject,
  createRef,
  doWatch,
  effect,
  isReactive,
  isRef,
  postCleanEffect,
  preCleanEffect,
  proxyRefs,
  reactive,
  ref,
  renderOptions,
  toReactive,
  toRef,
  toRefs,
  trackEffect,
  trackRefValue,
  triggerRefValue,
  watch,
  watchEffect
};
//# sourceMappingURL=runtime-dom.esm.js.map
