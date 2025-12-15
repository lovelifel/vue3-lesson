const targetMap = new WeakMap();

//收集依赖
export function track(target, key) {
  let depsMap = targetMap.get(target); //判断有没有依赖
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()));
  }

  let dep = depsMap.get(key);
  if (!dep) {
    depsMap.set(key, (dep = new Map()));
  }
  console.log("track", key, targetMap, depsMap, dep);
}
