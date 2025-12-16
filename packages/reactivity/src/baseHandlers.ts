import { track, trigger } from "./reactiveEffect";

export enum ReactiveFlags {
  IS_REACTIVE = "__v_isReactive",
}

export const baseHandlers = {
  get(target, key, receiver) {
    if (key === ReactiveFlags.IS_REACTIVE) return true;
    track(target, key);
    return Reflect.get(target, key, receiver);
  },

  set(target, key, value, receiver) {
    let result = Reflect.set(target, key, value, receiver);
    trigger(target, key);
    return result;
  },
};
