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
    this._running = 0;
  }
  run() {
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
    this.active = false;
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
      ref2.dep = createDep(() => ref2.dep = void 0, "undefined")
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
export {
  activeEffect,
  cleanDepEffect,
  createProxyObject,
  createRef,
  effect,
  postCleanEffect,
  preCleanEffect,
  reactive,
  ref,
  toReactive,
  toRef,
  toRefs,
  trackEffect,
  trackRefValue,
  triggerRefValue
};
//# sourceMappingURL=reactivity.esm.js.map
