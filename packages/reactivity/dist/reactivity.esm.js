// packages/reactivity/src/effect.ts
function effect(fn, options) {
  const _effect = new ReactiveEffect(fn, () => {
    _effect.run();
  });
  _effect.run();
}
var ReactiveEffect = class {
  constructor(fn, scheduler) {
    this.fn = fn;
    this.scheduler = scheduler;
    this.active = true;
  }
  run() {
    if (!this.active) {
      return this.fn();
    }
    try {
      this.fn();
    } catch (error) {
      console.error(error);
    }
  }
};

// packages/shared/src/index.ts
function isObject(value) {
  return typeof value === "object" && value !== null;
}

// packages/reactivity/src/reactiveEffect.ts
var targetMap = /* @__PURE__ */ new WeakMap();
function track(target, key) {
  let depsMap = targetMap.get(target);
  if (!depsMap) {
    targetMap.set(target, depsMap = /* @__PURE__ */ new Map());
  }
  let dep = depsMap.get(key);
  if (!dep) {
    depsMap.set(key, dep = /* @__PURE__ */ new Map());
  }
  console.log("track", key, targetMap, depsMap, dep);
}

// packages/reactivity/src/baseHandlers.ts
var baseHandlers = {
  get(target, key, receiver) {
    console.log("get");
    if (key === "__v_isReactive" /* IS_REACTIVE */) return true;
    track(target, key);
    return Reflect.get(target, key, receiver);
  },
  set(target, key, value, receiver) {
    console.log("set");
    return Reflect.set(target, key, value, receiver);
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
export {
  createProxyObject,
  effect,
  reactive
};
//# sourceMappingURL=reactivity.esm.js.map
