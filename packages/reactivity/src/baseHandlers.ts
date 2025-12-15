import { track } from "./reactiveEffect";

export enum ReactiveFlags {
  IS_REACTIVE = "__v_isReactive",
}

export const baseHandlers = {
  get(target, key, receiver) {
    console.log("get");
    if (key === ReactiveFlags.IS_REACTIVE) return true;
    //收集依赖
    track(target, key);
    return Reflect.get(target, key, receiver);
  },

  set(target, key, value, receiver) {
    console.log("set");
    return Reflect.set(target, key, value, receiver);
  },
};
