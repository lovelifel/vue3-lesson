import { DirtyLevels } from "./constants";
import { trackEffect, activeEffect } from "./effect";

const targetMap = new WeakMap();

export function track(target, key) {
  if (!activeEffect) return;
  let depsMap = targetMap.get(target);
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()));
  }

  let dep = depsMap.get(key);
  if (!dep) {
    depsMap.set(
      key,
      (dep = createDep(() => {
        depsMap.delete(key);
      }, key))
    );
  }
  trackEffect(activeEffect, dep);
}

export function createDep(cleanUp, key) {
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
    if (effect._dirtyLevel < DirtyLevels.Dirty) {
      effect._dirtyLevel = DirtyLevels.Dirty;
    }
    if (!effect._running) {
      if (effect.scheduler) {
        effect.scheduler();
      }
    }
  }
}
