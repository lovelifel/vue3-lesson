import { isObject } from "@vue/shared";
import { baseHandlers, ReactiveFlags } from "./baseHandlers";
const cacheProxyMap = new WeakMap();

export function reactive(target) {
  return createReactiveObject(target);
}

export function createReactiveObject(target) {
  if (!isObject(target)) {
    return target;
  }
  const existProxy = cacheProxyMap.get(target);
  if (existProxy) {
    return existProxy;
  }

  if (target[ReactiveFlags.IS_REACTIVE]) {
    return target;
  }

  const proxy = new Proxy(target, baseHandlers);
  cacheProxyMap.set(target, proxy);
  return proxy;
}
