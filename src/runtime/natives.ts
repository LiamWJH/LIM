import { expect } from "bun:test";
import type { Value, NativeImpl } from "../parser/ast";


function asNum(n: Extract<Value, { kind: "Num" }>): number {
    return n.value;
}
function asStr(n: Extract<Value, { kind: "Str" }>): string {
    return n.value;
}
function asBool(n: Extract<Value, { kind: "Bool" }>): boolean {
    return n.value;
}
function asNil(n: Extract<Value, { kind: "Nil" }>): null {
    return null
}
function asArr(n: Extract<Value, { kind: "Array" }>): any[] {
    //console.log(n)
    return n.value.map(asNativeT)
}

function asNativeT(n: Value): number | string | boolean | any[] | false| true | null {
    switch (n.kind) {
        case "Num": return asNum(n)
        case "Str": return asStr(n)
        case "Bool": return asBool(n)
        case "Nil": return asNil(n)
        case "Array": return asArr(n)
        default: {
            throw new Error(n.kind);
        }
    }
}


export const printFn = {
    value: null,
    kind: "NativeFn",
    name: "print",
    arity: null,
    impl: (args: Value[]) => { console.log(args.map(asNativeT).join(" ")); return { kind: "Nil", value: null };},
} satisfies Extract<Value, { kind: "NativeFn" }>;

export const scanFn = {
    value: null,
    kind: "NativeFn",
    name: "scan",
    arity: null,
    impl: (args: Value[]) => {
        const msg =
            args.length >= 1 && args[0]!.kind === "Str"
                ? args[0]!.value
                : "> ";
        const line = prompt(msg) ?? "";
        return { kind: "Str", value: line };
    },
} satisfies Extract<Value, { kind: "NativeFn" }>;

export const lenFn = {
  value: null,
  kind: "NativeFn",
  name: "len",
  arity: 1,
  impl: (args: Value[]) => {
    const arg = args[0];
    if (!arg) throw new Error("len expects 1 argument");

    if (arg.kind === "Num") throw new Error("cannot perform 'length' on type 'number'");
    if (arg.kind === "Bool") throw new Error("cannot perform 'length' on type 'boolean'");
    if (arg.kind === "Nil") throw new Error("cannot perform 'length' on type 'nil'");

    if (arg.kind === "Str") return { kind: "Num", value: arg.value.length };
    if (arg.kind === "Array") return { kind: "Num", value: arg.value.length };

    throw new Error(`len not supported for ${arg.kind}`);
  },
} satisfies Extract<Value, { kind: "NativeFn" }>;

export const typeFn = {
  value: null,
  kind: "NativeFn",
  name: "type",
  arity: 1,
  impl: (args: Value[]) => {
    const arg = args[0];
    if (!arg) throw new Error("len expects 1 argument");

    if (arg.kind === "Str") return { kind: "Str", value: "string" };
    if (arg.kind === "Array") return { kind: "Str", value: "array" };
    if (arg.kind === "Bool") return { kind: "Str", value: "boolean" };
    if (arg.kind === "Fn") return { kind: "Str", value: "function wtf" };
    if (arg.kind === "Index") return { kind: "Str", value: "index" };
    if (arg.kind === "NativeFn") return { kind: "Str", value: "native function wtf" };
    if (arg.kind === "Nil") return { kind: "Str", value: "nil" };
    if (arg.kind === "Num") return { kind: "Str", value: "number" };
    return { kind: "Str", value: "fucking internal error here " };
  },
} satisfies Extract<Value, { kind: "NativeFn" }>;


export const biggestFn = {
  value: null,
  kind: "NativeFn",
  name: "biggest",
  arity: null,
  impl: (args: Value[]) => {
    if (args.length === 0) throw new Error("'biggest' expects at least 1 argument");
    for (const v of args) {
      if (v.kind !== "Num") throw new Error("'biggest' expects only numbers");
    }
    let m = (args[0] as Extract<Value, {kind:"Num"}>).value;
    for (let i = 1; i < args.length; i++) {
      const n = (args[i] as Extract<Value, {kind:"Num"}>).value;
      if (n > m) m = n;
    }
    return { kind: "Num", value: m };
  },
} satisfies Extract<Value, { kind: "NativeFn" }>;

export const smallestFn = {
  value: null,
  kind: "NativeFn",
  name: "smallest",
  arity: null,
  impl: (args: Value[]) => {
    if (args.length === 0) throw new Error("'smallest' expects at least 1 argument");
    for (const v of args) {
      if (v.kind !== "Num") throw new Error("'smallest' expects only numbers");
    }
    let m = (args[0] as Extract<Value, {kind:"Num"}>).value;
    for (let i = 1; i < args.length; i++) {
      const n = (args[i] as Extract<Value, {kind:"Num"}>).value;
      if (n < m) m = n;
    }
    return { kind: "Num", value: m };
  },
} satisfies Extract<Value, { kind: "NativeFn" }>;

export const appendFn = {
  value: null,
  kind: "NativeFn",
  name: "append",
  arity: 2,
  impl: (args: Value[]) => {
    if (args.length !== 2) throw new Error("'append' expects 2 arguments");
    const arr = args[0]!;
    const item = args[1]!;

    if (arr!.kind !== "Array") throw new Error("'append' needs an array for the first argument");

    arr!.value!.push(item!);
    return arr;
  },
} satisfies Extract<Value, { kind: "NativeFn" }>;

export const removeFn = {
  value: null,
  kind: "NativeFn",
  name: "delete",
  arity: 2,
  impl: (args: Value[]) => {
    if (args.length !== 2) throw new Error("'delete' expects 2 arguments");
    const arr = args[0]!;
    const index = args[1]!;

    if (!(arr!.kind === "Array" || arr!.kind === "Str")) throw new Error("'delete' needs an array or string for the first argument");
    if (index!.kind !== "Num") throw new Error("'delete' needs a number for the second argument");

    if (arr!.kind === "Array") return { kind: "Array", value: arr!.value!.splice(index.value, 1)};
    else return  { kind: "Str", value: arr!.value.slice(0, index.value) + arr!.value.slice(index.value + 1)};

  },
} satisfies Extract<Value, { kind: "NativeFn" }>;


/**
 * TODO: Add methd(a.x(b)), it should compile down to x(a,b)
 * dont forget that we are NOT implementing extra node
 * we are compiling a.b(x) down to b(x, a) in the parser
 * in interp.ts we also have to see if a has b() later when we add OOP
*/