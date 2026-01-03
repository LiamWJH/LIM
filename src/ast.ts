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

export type Value =
    | { kind: "Num"; value: number }
    | { kind: "Str"; value: string }
    | { kind: "Bool"; value: boolean }
    | { kind: "Nil" }

export type Expr =
    | { kind: "Num"; value: number }
    | { kind: "Str"; value: string }
    | { kind: "Bool"; value: boolean }
    | { kind: "Nil" }
    | { kind: "Ident"; name: string }
    | { kind: "Unary"; op: UnaryOp; rhs: Expr }
    | { kind: "Binary"; op: BinaryOp; lhs: Expr; rhs: Expr }
    | { kind: "Group"; expr: Expr }
    | { kind: "Call"; callee: Expr; args: Expr[] };

export type Stmt =
    | { kind: "Let"; name: string; init: Expr | null }
    | { kind: "Assign"; name: string; op: AssignOp; value: Expr }
    | { kind: "Print"; expr: Expr }
    | { kind: "ExprStmt"; expr: Expr }
    | { kind: "Block"; stmts: Stmt[] }
    | { kind: "If"; cond: Expr; then: Stmt; otherwise?: Stmt }
    | { kind: "While"; cond: Expr; body: Stmt }
    | { kind: "Fn"; name: string; params: string[]; body: Stmt }
    | { kind: "Return"; value?: Expr };

export type Program = {
    stmts: Stmt[];
    localCount: number;
};