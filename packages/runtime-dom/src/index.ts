import { nodeOps } from "./nodeOps";
import patchProp from "./patchProp";

export const renderOptions = Object.assign({ patchProp }, nodeOps);
export * from "@vue/reactivity";
