import type { Value } from "./ast";


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

function asNativeT(n: Value): number | string | boolean | null {
    switch (n.kind) {
        case "Num": return asNum(n)
        case "Str": return asStr(n)
        case "Bool": return asBool(n)
        case "Nil": return asNil(n)
        default: {
            throw new Error("'Unexpected type' from inner function 'asNativeT' ");
        }
    }
}

export const printFn = {
    kind: "NativeFn",
    name: "print",
    arity: null,
    impl: (args: Value[]) => { console.log(args.map(asNativeT).join(" ")); return { kind: "Nil" }; },
} satisfies Extract<Value, { kind: "NativeFn" }>;

export const scanFn = {
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
