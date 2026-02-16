import type { TokenKind, Token } from "../lexer/token";
import type { AssignOp, BinaryOp, Expr, Stmt, Program, Value } from "../parser/ast";
import { printFn, scanFn, lenFn, smallestFn, biggestFn, appendFn, removeFn } from "./natives";

export class InterpError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InterpError";
  }
}

export class Env {
    values = new Map<string, Value>();
    parentenv: Env | null;

    constructor(parent: Env | null) {
        this.parentenv = parent;
    }

    private error(message: string): InterpError {
        return new InterpError(message);
    }

    define(name: string, value: Value) {
        this.values.set(name,value);
    }

    get(name: string): Value {
        if (this.values.has(name)) return this.values.get(name)!;
        if (this.parentenv) return this.parentenv.get(name);
        throw this.error(`cannot get value for a undefined name '${name}'`);
    }

    assign(name: string, value: Value) {
        if (this.values.has(name)) {
            this.values.set(name, value);
            return;
        }
        if (this.parentenv) {
            this.parentenv.assign(name, value);
            return;
        }
        throw new Error(`cannot set value for a undefined variable '${name}'`);
    }
}

class ReturnSignal {
    constructor(public value: Value) {};
}

export class Module {
    env: Env;
    exports = new Map<string, Value>();

    constructor(public name: string, globalEnv: Env) {
        this.env = new Env(globalEnv);
    }
}



export class Runtime {
    i = 0;
    globalenv = new Env(null);
    moduleenv: Module;
    env: Env;

    public errors: InterpError[] = [];

    constructor() {
        this.globalenv = new Env(null);
        this.moduleenv = new Module("main", this.globalenv);
        this.env = this.moduleenv.env;
        this.installNatives();
    }

    private error(message: string): InterpError {
        return new InterpError(message);
    }

    run(program: Stmt[]) {
        try {
            for (const stmt of program) this.exec(stmt);
        } catch(e) {
            if (e instanceof InterpError) {
                this.errors.push(e);
                console.error(`[RuntimeError] ${e.message}`);
                return;
            }
            throw e;
        }
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
        return { kind: "Nil", value: null};
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
            throw this.error(`addition between '${a}' and '${b}' does not work.`)
        }
    }
    private opSub(a: Value, b: Value): Value {
        if (a.kind === "Num" && b.kind === "Num") {
            return this.toNum(this.asNum(a) - this.asNum(b));
        } else {
            throw this.error(`subtraction between '${a}' and '${b}' does not work.`)
        }
    }
    private opMul(a: Value, b: Value): Value {
        if (a.kind === "Num" && b.kind === "Num") {
            return this.toNum(this.asNum(a) * this.asNum(b));
        } else {
            throw this.error(`multiplication between '${a}' and '${b}' does not work.`)
        }
    }
    private opDiv(a: Value, b: Value): Value {
        if (a.kind === "Num" && b.kind === "Num") {
            return this.toNum(this.asNum(a) / this.asNum(b));
        } else {
            throw this.error(`division between '${a}' and '${b}' does not work.`)
        }
    }

    private isTruthy(c: Value): boolean {
        switch (c.kind) {
            case "Nil": { return false; }
            case "Bool": { return c.value; }
            default: { return true; }
        }
    }

    private withEnv<T>(env: Env, fn: () => T): T {
        const prev = this.env;
        this.env = env;
        try {
            return fn();
        } finally {
            this.env = prev;
        }
    }

    private callValue(callee: Value, args: Value[]): Value {
        if (callee.kind === "NativeFn") {
                if (callee.arity !== null && args.length !== callee.arity) {
                    throw this.error(`native ${callee.name} expects ${callee.arity} args`);
                }
            return callee.impl(args);
        }
        if (callee.kind !== "Fn") {
            throw this.error(`tried to call non-function value: ${callee.kind}`);
        }

        if (args.length !== callee.params.length) {
            throw this.error(
            `function ${callee.name ?? "<anon>"} expects ${callee.params.length} args but got ${args.length}`
            );
        }

        const callEnv = new Env(callee.closure);

        for (let i = 0; i < callee.params.length; i++) {
            const name = callee.params[i]!;
            callEnv.define(name, args[i]!);

        }


        try {
            return this.withEnv(callEnv, () => {
                for (const s of callee.body)
                this.exec(s);
                return this.toNil(null);
            });
        } catch (e) {
            if (e instanceof ReturnSignal) return e.value;
            throw e;
        }
    }



    private installNatives() {
        this.env.define("print", printFn);
        this.env.define("scan", scanFn);
        this.env.define("length", lenFn);
        this.env.define("smallest", smallestFn);
        this.env.define("biggest", biggestFn);
        this.env.define("append", appendFn);
        this.env.define("remove", removeFn);

        this.env.define("true", { kind: "Bool", value: true});
        this.env.define("false", { kind: "Bool", value: false});
        this.env.define("nil", { kind: "Nil", value: null});
    }

    private exec(stmt: Stmt) {
        switch (stmt.kind) {
            case "Let": {
                const val = this.eval(stmt.init!);
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
                        this.env.assign(stmt.name, this.opAdd(this.env.get(stmt.name), val));
                        return;
                    }
                    case "MINUS_ASSIGN": {
                        this.env.assign(stmt.name, this.opSub(this.env.get(stmt.name), val));
                        return;
                    }
                    case "STAR_ASSIGN": {
                        this.env.assign(stmt.name, this.opMul(this.env.get(stmt.name), val));
                        return;
                    }
                    case "SLASH_ASSIGN": {
                        this.env.assign(stmt.name, this.opDiv(this.env.get(stmt.name), val));
                        return;
                    }
                }
            }

            case "ExprStmt": {
                this.eval(stmt.expr);
                return;
            }

            case "Block": {
                const blockEnv = new Env(this.env);
                this.withEnv(blockEnv, () => {
                    for (const s of stmt.stmts) this.exec(s);
                })
                return;
            }

            case "Fn": {
                const fnVal: Value = {
                    value: null,
                    kind: "Fn",
                    name: stmt.name,
                    params: stmt.params,
                    body: stmt.body,
                    closure: this.env
                };

                this.env.define(stmt.name!, fnVal);
                return;
            }

            case "Export": {
                const obj = this.moduleenv.env.get(stmt.name);
                this.moduleenv.exports.set(stmt.name, obj);
                return;
            }

            case "If": {
                const condVal = this.eval(stmt.cond);

                if (this.isTruthy(condVal)) {
                    this.exec(stmt.then);
                    return;
                }

                for (const branch of stmt.elifs) {
                    if (this.isTruthy(this.eval(branch.cond))) {
                        this.exec(branch.then);
                        return;
                    }
                }

                if (stmt.elsewise) {
                    this.exec(stmt.elsewise);
                }

                return;
            }

            case "While": {
                while (this.isTruthy(this.eval(stmt.cond))) {
                    this.exec(stmt.body);
                }
                return;
            }

            case "Return": {
                const val = stmt.value ? this.eval(stmt.value) : this.toNil(null);
                throw new ReturnSignal(val);
            }

            default: { throw this.error("shitty syntax exec error bitch"); }
        }
    }

    private eval(expr: Expr): Value {
        switch (expr.kind) {
            case "Num":
            return { kind: "Num", value: expr.value };

            case "Str":
            return { kind: "Str", value: expr.value };

            case "Bool":
            return { kind: "Bool", value: expr.value };

            case "Nil":
            return { kind: "Nil", value: null };

            case "Array":
            return { kind: "Array", value: expr.value.map(x => this.eval(x)) }

            case "Index": {
                const target = this.eval(expr.target);
                const indexVal = this.eval(expr.index);

                if (!(target.kind === "Array" || target.kind === "Str")) {
                    throw this.error(`Indexing non-array: ${target.kind}`);
                }
                if (indexVal.kind !== "Num") {
                    throw this.error(`Array index must be a number, got: ${indexVal.kind}`);
                }

                const i = Math.trunc(indexVal.value);
                if (i < 0 || i >= target.value.length) return { kind: "Nil", value: null };

                if (typeof target.value[i] === "string") return { kind: "Str", value: target.value[i]};
                else return target.value[i] ?? { kind: "Nil", value: null };
            }

            case "Ident":
            return this.env.get(expr.name);

            case "Group":
            return this.eval(expr.expr);

            case "Unary": {
                const rhs = this.eval(expr.rhs);

                switch (expr.op) {
                    case "MINUS":
                        return this.opMul(rhs, this.toNum(-1));

                    case "NOT":
                        return this.toBool(!rhs);

                    default:
                        throw this.error(`Unknown unary operator`);
                }
            }

            case "Binary": {
                const left = this.eval(expr.lhs);
                const right = this.eval(expr.rhs);

                switch (expr.op) {
                    case "PLUS":
                        return this.opAdd(left, right);

                    case "MINUS":
                        return this.opSub(left, right);

                    case "STAR":
                        return this.opMul(left, right);

                    case "SLASH":
                        return this.opDiv(left, right);

                    case "EQUAL":
                        return this.toBool(left.kind === right.kind && left.value === right.value);

                    case "NOTEQ":
                        return this.toBool(left.kind !== right.kind || left.value !== right.value);

                    case "LT":
                        if (left.kind === right.kind) return this.toBool(left.value! < right.value!);
                        else throw this.error("Tried to compare with different types");
                    case "LTE":
                        if (left.kind === right.kind) return this.toBool(left.value! <= right.value!);
                        else throw this.error("Tried to compare with different types");
                    case "GT":
                        if (left.kind === right.kind) return this.toBool(left.value! > right.value!);
                        else throw this.error("Tried to compare with different types");
                    case "GTE":
                        if (left.kind === right.kind) return this.toBool(left.value! >= right.value!);
                        else throw this.error("Tried to compare with different types");
                    case "RANGE": {
                        if (left.kind !== "Num" || right.kind !== "Num") {
                            throw this.error("range '..' expects two numbers");
                        }

                        const start = Math.trunc(left.value);
                        const end = Math.trunc(right.value);

                        const out: Value[] = [];
                        const step = start <= end ? 1 : -1;

                        for (let i = start; step > 0 ? i <= end : i >= end; i += step) {
                            out.push({ kind: "Num", value: i });
                        }

                        return { kind: "Array", value: out };
                    }
                    case "OR": {
                        const left = this.eval(expr.lhs);
                        if (this.isTruthy(left)) return this.toBool(true);
                        const right = this.eval(expr.rhs);
                        return this.toBool(this.isTruthy(right));
                    }

                    case "AND": {
                        const left = this.eval(expr.lhs);
                        if (!this.isTruthy(left)) return this.toBool(false);
                        const right = this.eval(expr.rhs);
                        return this.toBool(this.isTruthy(right));
                    }


                    default:
                        throw this.error(`Unknown binary operator ${expr}`);
                    }
            }

            case "Call": {
                const callee = this.eval(expr.callee);
                const args = expr.args.map(a => this.eval(a));
                return this.callValue(callee, args);
            }

            default: {
                const _exhaustive: never = expr;
                return _exhaustive;
            }
        }
    }
}
