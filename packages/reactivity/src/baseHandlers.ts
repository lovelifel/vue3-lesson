import { track, trigger } from "./reactiveEffect";
import { reactive } from "./reactive";
import { isObject } from "@vue/shared";

export enum ReactiveFlags {
  IS_REACTIVE = "__v_isReactive",
  IS_REF = "__v_isRef",
}

export const baseHandlers = {
  get(target: any, key: any, receiver: any) {
    if (key === ReactiveFlags.IS_REACTIVE) return true;

    track(target, key);
    let result = Reflect.get(target, key, receiver);
    if (isObject(result)) {
      return reactive(result);
    }
    return result;
  },

  set(target, key, value, receiver) {
    let result = Reflect.set(target, key, value, receiver);
    trigger(target, key);
    return result;
  },
};
