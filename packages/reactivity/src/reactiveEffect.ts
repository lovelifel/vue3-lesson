import { activeEffect, trackEffect } from "./effect";
let targetMap = new WeakMap();

export function track(target, key) {
  if (activeEffect) {
    let depsMap = targetMap.get(target);
    if (!depsMap) {
      targetMap.set(target, (depsMap = new Map()));
    }

    let dep = depsMap.get(key);
    if (!dep) {
      depsMap.set(
        key,
        (dep = creatMap(() => {
          depsMap.delete(key);
        }, key))
      );
    }

    trackEffect(activeEffect, dep);
  }
}

export function creatMap(cleanUp, key) {
  const dep = new Map() as any;
  dep.cleanUp = cleanUp;
  dep.name = key;
  return dep;
}

export function trigger(target, key, oldValue, value) {
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

export function triggerEffects(dep) {
  for (const effect of dep.keys()) {
    if (effect.scheduler) {
      effect.scheduler();
    }
  }
}
