import { isObject } from "@vue/shared";
import { baseHandlers } from "./baseHandlers";
import { ReactiveFlags } from "./constants";

const cacheProxyMap = new WeakMap();

export function reactive(value) {
  //判断对象类型 非空
  if (!isObject(value)) {
    return value;
  }
  return createProxyObject(value);
}

export function createProxyObject(value) {
  const existProxy = cacheProxyMap.get(value);
  if (existProxy) {
    return existProxy;
  }
  if (value[ReactiveFlags.IS_REACTIVE]) {
    return value;
  }

  const proxy = new Proxy(value, baseHandlers);
  cacheProxyMap.set(value, proxy);
  return proxy;
}

export function toReactive(value) {
  return !isObject(value) ? value : createProxyObject(value);
}
