import type { TokenKind, Token } from "./token";
import type { AssignOp, BinaryOp, Expr, Stmt, Program, Value } from "./ast";

export class Env {
    values = new Map<string, Value>();
    parentenv: Env | null;

    constructor(parent: Env | null) {
        this.parentenv = parent;
    }

    define(name: string, value: Value) {
        this.values.set(name,value);
    }

    get(name: string): Value {
        if (this.values.has(name)) return this.values.get(name)!;
        throw new Error(`cannot get value for a undefined variable '${name}'`);
    }

    assign(name: string, value: Value) {
        if (this.values.has(name)) {
            this.values.set(name, value);
            return;
        }
        throw new Error(`cannot set value for a undefined variable '${name}'`);
    }
}

export class Runtime {
    i = 0;
    globalenv = new Env(null);
    env: Env;

    constructor() {
        this.globalenv = new Env(null);
        this.env = this.globalenv;
        // this.installNatives() LATER
    }

    run(program: Stmt[]) {
        for (const stmt of program) this.exec(stmt); // Later exec will be a thing
    }

    private toNum(n: number): Value {
        return { kind: "Num", value: n };
    }
    private toStr(s: string): Value {
        return { kind: "Str", value: s };
    }
    private toBool(b: boolean): Value {
        return { kind: "Bool", value: b };
    }
    private toNil(nil: null): Value {
        return { kind: "Nil"};
    }

    private asNum(n: Extract<Value, { kind: "Num" }>): number {
        return n.value;
    }
    private asStr(n: Extract<Value, { kind: "Str" }>): string {
        return n.value;
    }
    private asBool(n: Extract<Value, { kind: "Bool" }>): boolean {
        return n.value;
    }
    private asNil(n: Extract<Value, { kind: "Nil" }>): null {
        return null
    }


    private opAdd(a: Value, b: Value): Value {
        if (a.kind === "Str" && b.kind === "Str") {
            return this.toStr(this.asStr(a) + this.asStr(b));
        } else if (a.kind === "Num" && b.kind === "Num") {
            return this.toNum(this.asNum(a) + this.asNum(b));
        } else {
            throw new Error(`addition between '${a}' and '${b}' does not work.`)
        }
    }
    private opSub(a: Value, b: Value): Value {
        if (a.kind === "Num" && b.kind === "Num") {
            return this.toNum(this.asNum(a) + this.asNum(b));
        } else {
            throw new Error(`addition between '${a}' and '${b}' does not work.`)
        }
    }


    private exec(stmt: Stmt) {
        switch (stmt.kind) {
            case "Let": {
                const val = this.eval(stmt.init);
                this.env.define(stmt.name, val);
                return;
            }

            case "Assign": {
                const val = this.eval(stmt.value);
                const op = stmt.op;
                switch (op) {
                    case "ASSIGN": {
                        this.env.assign(stmt.name, val);
                        return;
                    }
                    case "PLUS_ASSIGN": {
                        this.env.assign(stmt.name, this.env.get(stmt.name) + val);
                        return;
                    }
                    case "MINUS_ASSIGN": {
                        this.env.assign(stmt.name, this.env.get(stmt.name) - val);
                        return;
                    }
                    case "STAR_ASSIGN": {
                        this.env.assign(stmt.name, this.env.get(stmt.name) * val);
                        return;
                    }
                    case "SLASH_ASSIGN": {
                        this.env.assign(stmt.name, this.env.get(stmt.name) / val);
                        return;
                    }
                }
            }
        }
    }

    // eval for expr and Ident and assign. exec for stmt
}