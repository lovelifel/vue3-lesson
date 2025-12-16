import { trackEffect, activeEffect } from "./effect";

const targetMap = new WeakMap();

//收集依赖
export function track(target, key) {
  let depsMap = targetMap.get(target); //判断有没有依赖
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()));
  }

  let dep = depsMap.get(key);
  if (!dep) {
    depsMap.set(
      key,
      (dep = createMap(() => {
        depsMap.delete(key);
      }, key))
    );
  }
  trackEffect(activeEffect, dep);
}

export function createMap(cleanUp, key) {
  let dep = new Map() as any;
  dep.cleanUp = cleanUp;
  dep.name = key;
  return dep;
}

export function trigger(target, key) {
  const depsMap = targetMap.get(target);
  if (!depsMap) {
    return;
  }

  const dep = depsMap.get(key);
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
