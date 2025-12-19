import { isObject } from "@vue/shared";
import { ReactiveEffect } from "./effect";
import { isReactive } from "./reactive";
import { isRef } from "./ref";
import { isFunction } from "@vue/shared";
export function watch(source, cb, options) {
  return doWatch(source, cb, options);
}

export function doWatch(source, cb, { deep, immediate }) {
  const reactiveGetter = (source) =>
    traverse(source, deep === false ? 1 : undefined);
  let getter;
  //判断是响应式
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
      const newValue = effect.run();
      cb(newValue, oldValue);
      oldValue = newValue;
    } else {
      effect.run();
    }
  };

  const effect = new ReactiveEffect(getter, job);
  if (cb) {
    if (immediate) {
      job();
    } else {
      oldValue = effect.run();
    }
  } else {
    effect.run();
  }
}

function traverse(source, depth, currentDepth = 0, seen = new Set()) {
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

export function watchEffect(source, options = {}) {
  return doWatch(source, null, options as any);
}
