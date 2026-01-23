import type { Runtime } from "inspector/promises";
import { Env } from "./interp";

export type AssignOp =
    | "ASSIGN"
    | "PLUS_ASSIGN"
    | "MINUS_ASSIGN"
    | "STAR_ASSIGN"
    | "SLASH_ASSIGN";

export type BinaryOp =
    | "OR"
    | "AND"
    | "EQUAL"
    | "NOTEQ"
    | "LT"
    | "LTE"
    | "GT"
    | "GTE"
    | "PLUS"
    | "MINUS"
    | "STAR"
    | "SLASH";

export type UnaryOp =
    | "NOT"
    | "MINUS";


export type NativeImpl = (args: Value[]) => Value;


export type Value =
    | { kind: "Num"; value: number }
    | { kind: "Str"; value: string }
    | { kind: "Bool"; value: boolean }
    | { kind: "Nil"; value: null }
    | { kind: "Fn"; name: string | null; params: string[]; body: Stmt[]; closure: Env; value: null }
    | { kind: "NativeFn"; name: string; arity: Number | null; impl: NativeImpl; value: null }
    | { kind: "Index"; target: string; index: number; value: null }
    | { kind: "Array"; value: Value[];}

export type Expr =
    | { kind: "Num"; value: number }
    | { kind: "Str"; value: string }
    | { kind: "Bool"; value: boolean }
    | { kind: "Array"; value: Expr[] }
    | { kind: "Nil" }
    | { kind: "Ident"; name: string }
    | { kind: "Unary"; op: UnaryOp; rhs: Expr }
    | { kind: "Binary"; op: BinaryOp; lhs: Expr; rhs: Expr }
    | { kind: "Group"; expr: Expr }
    | { kind: "Call"; callee: Expr; args: Expr[] }
    | { kind: "Index"; target: Expr; index: Expr; }


export type Stmt =
    | { kind: "Let"; name: string; init: Expr | null }
    | { kind: "Assign"; name: string; op: AssignOp; value: Expr }
    | { kind: "ExprStmt"; expr: Expr }
    | { kind: "Block"; stmts: Stmt[] }
    | { kind: "If"; cond: Expr; then: Stmt; otherwise?: Stmt }
    | { kind: "While"; cond: Expr; body: Stmt }
    | { kind: "Fn"; name: string | null; params: string[]; body: Stmt[] }
    | { kind: "Return"; value?: Expr }
    | { kind: "Export"; name: string }

export type Program = {
    stmts: Stmt[];
    localCount: number;
};