// packages/shared/src/index.ts
function isObject(value) {
  return typeof value === "object" && value !== null;
}

// packages/reactivity/src/effect.ts
var activeEffect = void 0;
function effect(fn, options) {
  const _effect = new ReactiveEffect(fn, () => {
    _effect.run();
  });
  _effect.run();
}
var ReactiveEffect = class {
  //是否开启响应
  constructor(fn, scheduler) {
    this.fn = fn;
    this.scheduler = scheduler;
    this._trackId = 0;
    //用于记录当前effect执行了几次
    this.deps = [];
    this._depsLength = 0;
    this.active = true;
  }
  run() {
    if (!this.active) {
      return this.fn();
    }
    let lastEffect = activeEffect;
    try {
      activeEffect = this;
      return this.fn();
    } finally {
      activeEffect = lastEffect;
    }
  }
  stop() {
    this.active = false;
  }
};
function trackEffect(effect2, dep) {
  dep.set(effect2, effect2._trackId);
  effect2.deps[effect2._depsLength++] = dep;
}

// packages/reactivity/src/reactiveEffect.ts
var targetMap = /* @__PURE__ */ new WeakMap();
function track(target, key) {
  if (activeEffect) {
    let depsMap = targetMap.get(target);
    if (!depsMap) {
      targetMap.set(target, depsMap = /* @__PURE__ */ new Map());
    }
    let dep = depsMap.get(key);
    if (!dep) {
      depsMap.set(
        key,
        dep = creatMap(() => {
          depsMap.delete(key);
        }, key)
      );
    }
    trackEffect(activeEffect, dep);
  }
}
function creatMap(cleanUp, key) {
  const dep = /* @__PURE__ */ new Map();
  dep.cleanUp = cleanUp;
  dep.name = key;
  return dep;
}
function trigger(target, key, oldValue, value) {
  debugger;
  const depsMap = targetMap.get(target);
  if (!depsMap) {
    return;
  }
  let dep = depsMap.get(key);
  if (dep) {
    triggerEffects(dep);
  }
}
function triggerEffects(dep) {
  for (const effect2 of dep.keys()) {
    if (effect2.scheduler) {
      effect2.scheduler();
    }
  }
}

// packages/reactivity/src/baseHandlers.ts
var baseHandlers = {
  get(target, key, receiver) {
    if (key === "__v_isReactive" /* IS_REACTIVE */) {
      return true;
    }
    track(target, key);
    return Reflect.get(target, key, receiver);
  },
  set(target, key, value, receiver) {
    let oldValue = target[key];
    let result = Reflect.set(target, key, value, receiver);
    if (oldValue !== value) {
      trigger(target, key, oldValue, value);
    }
    return result;
  }
};

// packages/reactivity/src/reactive.ts
var cacheProxyMap = /* @__PURE__ */ new WeakMap();
function reactive(target) {
  return createReactiveObject(target);
}
function createReactiveObject(target) {
  if (!isObject(target)) {
    return target;
  }
  const existProxy = cacheProxyMap.get(target);
  if (existProxy) {
    return existProxy;
  }
  if (target["__v_isReactive" /* IS_REACTIVE */]) {
    return target;
  }
  const proxy = new Proxy(target, baseHandlers);
  cacheProxyMap.set(target, proxy);
  return proxy;
}
export {
  activeEffect,
  createReactiveObject,
  effect,
  reactive,
  trackEffect
};
//# sourceMappingURL=reactivity.esm.js.map
