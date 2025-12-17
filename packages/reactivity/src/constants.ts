export enum ReactiveFlags {
  IS_REACTIVE = "__v_isReactive",
  IS_REF = "__v_isRef",
}

export enum DirtyLevels {
  Dirty = 4, //计算
  NoDirty = 0, //不计算
}
