import { toReactive } from "./reactive";
import { activeEffect, trackEffect } from "./effect";
import { createDep, triggerEffects } from "./reactiveEffect";
export function ref(value) {
  return createRef(value);
}

export function createRef(value) {
  return new RefImpl(value);
}

class RefImpl {
  public __v_isRef = true;
  public _value;
  public dep;
  constructor(public rawValue) {
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
}

export function trackRefValue(ref) {
  if (activeEffect) {
    trackEffect(
      activeEffect,
      (ref.dep =
        ref.dep || createDep(() => (ref.dep = undefined), "undefined")),
    );
  }
}

export function triggerRefValue(ref) {
  let dep = ref.dep;
  if (dep) {
    triggerEffects(dep);
  }
}
export function toRef(obj, key) {
  return new ObjectRefImpl(obj, key);
}

class ObjectRefImpl {
  public __v_isRef = true;
  constructor(
    public target,
    public key,
  ) {}
  get value() {
    return this.target[this.key];
  }
  set value(newValue) {
    this.target[this.key] = newValue;
  }
}

export function toRefs(obj) {
  const ret = {};
  for (const key in obj) {
    ret[key] = toRef(obj, key);
  }
  return ret;
}

export function proxyRefs(target) {
  return new Proxy(target, {
    get(target, key, receiver) {
      const original = Reflect.get(target, key, receiver);
      return original.__v_isRef ? original.value : original;
    },

    set(target, key, value, receiver) {
      const oldValue = target[key];
      if (oldValue.__v_isRef) {
        oldValue.value = value;
      } else {
        return Reflect.set(target, key, value, receiver);
      }
    },
  });
}

export function isRef(value) {
  return value.__v_isRef === true;
}
