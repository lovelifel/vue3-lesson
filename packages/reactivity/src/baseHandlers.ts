import { activeEffect } from "./effect";
export enum ReactiveFlags {
  IS_REACTIVE = "__v_isReactive",
}

export const baseHandlers = {
  get(target, key, receiver) {
    if (key === ReactiveFlags.IS_REACTIVE) {
      return true;
    }
    console.log(activeEffect, key);
    return Reflect.get(target, key, receiver);
  },
  set(target, key, value, receiver) {
    return Reflect.set(target, key, value, receiver);
  },
};
