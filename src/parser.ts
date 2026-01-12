// parser.ts
import type { AssignOp, BinaryOp, UnaryOp, Expr, Stmt } from "./ast";
import type { Token, TokenKind } from "./token";
import { TK } from "./token";

export class ParseError extends Error {
  constructor(public token: Token, message: string) {
    super(message);
    this.name = "ParseError";
  }
}

export class Parser {
  private i = 0;
  public errors: ParseError[] = [];

  constructor(private readonly tokens: Token[]) {}

  // =========
  // Program
  // =========
  parseProgram(): Stmt[] {
    const out: Stmt[] = [];
    while (!this.isAtEnd()) {
      const stmt = this.declaration();
      if (stmt) out.push(stmt);
    }
    return out;
  }

  // =====================
  // Decls / Statements
  // =====================
  private declaration(): Stmt | null {
    try {
      if (this.match(TK.FUNC)) return this.fnDecl();
      if (this.match(TK.LET)) return this.letDecl();
      return this.statement();
    } catch (e) {
      if (e instanceof ParseError) {
        this.errors.push(e);
        this.synchronize();
        return null;
      }
      throw e;
    }
  }

  private statement(): Stmt {
    if (this.match(TK.IF)) return this.ifStmt();
    if (this.match(TK.WHILE)) return this.whileStmt();
    if (this.match(TK.LBRACE)) return this.blockStmtAlreadyOpened();
    // If you add RETURN later, wire it here.
    return this.exprOrAssignStmt();
  }

  private letDecl(): Stmt {
    const nameTok = this.consume(TK.IDENT, "Expected identifier after 'let'.");
    let init: Expr | null = null;

    if (this.match(TK.ASSIGN)) {
      init = this.expression();
    }

    this.consume(TK.SEMICOLON, "Expected ';' after let declaration.");
    return { kind: "Let", name: nameTok.lexeme, init };
  }

  private fnDecl(): Stmt {
    const nameTok = this.consume(TK.IDENT, "Expected function name after 'func'.");

    this.consume(TK.LPAREN, "Expected '(' after function name.");
    const params: string[] = [];
    if (!this.check(TK.RPAREN)) {
      do {
        const p = this.consume(TK.IDENT, "Expected parameter name.");
        params.push(p.lexeme);
      } while (this.match(TK.COMMA));
    }
    this.consume(TK.RPAREN, "Expected ')' after parameters.");

    // IMPORTANT: Fn.body should be Stmt[], not a Block Stmt
    this.consume(TK.LBRACE, "Expected '{' before function body.");
    const body = this.blockStmtsAlreadyOpened(); // ✅ Stmt[]

    return { kind: "Fn", name: nameTok.lexeme, params, body };
  }

  private ifStmt(): Stmt {
    this.consume(TK.LPAREN, "Expected '(' after 'if'.");
    const cond = this.expression();
    this.consume(TK.RPAREN, "Expected ')' after condition.");

    const then = this.statement();
    let otherwise: Stmt | undefined = undefined;
    if (this.match(TK.ELSE)) {
      otherwise = this.statement();
    }

    return { kind: "If", cond, then, otherwise };
  }

  private whileStmt(): Stmt {
    this.consume(TK.LPAREN, "Expected '(' after 'while'.");
    const cond = this.expression();
    this.consume(TK.RPAREN, "Expected ')' after condition.");
    const body = this.statement();
    return { kind: "While", cond, body };
  }

  // ---------------------
  // Blocks
  // ---------------------

  // If you want a "Block" statement (for `{ ... }` in normal code)
  // Called when we've already consumed '{'
  private blockStmtAlreadyOpened(): Stmt {
    const stmts = this.blockStmtsAlreadyOpened();
    return { kind: "Block", stmts };
  }

  // The same block parser, but returns the raw Stmt[] (needed for Fn.body)
  // Called when we've already consumed '{'
  private blockStmtsAlreadyOpened(): Stmt[] {
    const stmts: Stmt[] = [];
    while (!this.check(TK.RBRACE) && !this.isAtEnd()) {
      const s = this.declaration();
      if (s) stmts.push(s);
    }
    this.consume(TK.RBRACE, "Expected '}' after block.");
    return stmts;
  }

  /**
   * Handles either:
   *   expr ;
   * or:
   *   ident (=|+=|-=|*=|/=) expr ;
   */
  private exprOrAssignStmt(): Stmt {
    // Lookahead: IDENT followed by assignment-ish token => assignment stmt
    if (this.check(TK.IDENT) && this.peekIsAssignOp()) {
      const name = this.advance().lexeme; // consume IDENT
      const opTok = this.advance();       // consume ASSIGN or PLUS_ASSIGN etc
      const op = this.assignOpFromToken(opTok);

      const value = this.expression();
      this.consume(TK.SEMICOLON, "Expected ';' after assignment.");
      return { kind: "Assign", name, op, value };
    }

    const expr = this.expression();
    this.consume(TK.SEMICOLON, "Expected ';' after expression.");
    return { kind: "ExprStmt", expr };
  }

  private peekIsAssignOp(): boolean {
    const next = this.peek();
    if (!next) return false;
    return (
      next.kind === TK.ASSIGN ||
      next.kind === TK.PLUS_ASSIGN ||
      next.kind === TK.MINUS_ASSIGN ||
      next.kind === TK.STAR_ASSIGN ||
      next.kind === TK.SLASH_ASSIGN
    );
  }

  private assignOpFromToken(tok: Token): AssignOp {
    switch (tok.kind) {
      case TK.ASSIGN: return "ASSIGN";
      case TK.PLUS_ASSIGN: return "PLUS_ASSIGN";
      case TK.MINUS_ASSIGN: return "MINUS_ASSIGN";
      case TK.STAR_ASSIGN: return "STAR_ASSIGN";
      case TK.SLASH_ASSIGN: return "SLASH_ASSIGN";
      default:
        throw this.error(tok, `Expected assignment operator, got '${tok.kind}'.`);
    }
  }

  // =====================
  // Expressions (ladder)
  // =====================
  private expression(): Expr {
    return this.logicOr();
  }

  private logicOr(): Expr {
    let expr = this.logicAnd();
    while (this.match(TK.OR)) {
      const rhs = this.logicAnd();
      expr = { kind: "Binary", op: "OR" as unknown as BinaryOp, lhs: expr, rhs };
    }
    return expr;
  }

  private logicAnd(): Expr {
    let expr = this.equality();
    while (this.match(TK.AND)) {
      const rhs = this.equality();
      expr = { kind: "Binary", op: "AND" as unknown as BinaryOp, lhs: expr, rhs };
    }
    return expr;
  }

  private equality(): Expr {
    let expr = this.comparison();
    while (this.match(TK.EQUAL, TK.NOTEQ)) {
      const opTok = this.previous();
      const rhs = this.comparison();
      const op = (opTok.kind === TK.EQUAL ? "EQUAL" : "NOTEQ") as unknown as BinaryOp;
      expr = { kind: "Binary", op, lhs: expr, rhs };
    }
    return expr;
  }

  private comparison(): Expr {
    let expr = this.term();
    while (this.match(TK.LT, TK.LTE, TK.GT, TK.GTE)) {
      const opTok = this.previous();
      const rhs = this.term();
      const op =
        (opTok.kind === TK.LT ? "LT" :
         opTok.kind === TK.LTE ? "LTE" :
         opTok.kind === TK.GT ? "GT" :
         "GTE") as unknown as BinaryOp;

      expr = { kind: "Binary", op, lhs: expr, rhs };
    }
    return expr;
  }

  private term(): Expr {
    let expr = this.factor();
    while (this.match(TK.PLUS, TK.MINUS)) {
      const opTok = this.previous();
      const rhs = this.factor();
      const op = (opTok.kind === TK.PLUS ? "PLUS" : "MINUS") as unknown as BinaryOp;
      expr = { kind: "Binary", op, lhs: expr, rhs };
    }
    return expr;
  }

  private factor(): Expr {
    let expr = this.unary();
    while (this.match(TK.STAR, TK.SLASH)) {
      const opTok = this.previous();
      const rhs = this.unary();
      const op = (opTok.kind === TK.STAR ? "STAR" : "SLASH") as unknown as BinaryOp;
      expr = { kind: "Binary", op, lhs: expr, rhs };
    }
    return expr;
  }

  private unary(): Expr {
    if (this.match(TK.NOT, TK.MINUS, TK.BANG)) {
      const opTok = this.previous();
      const rhs = this.unary();
      const op = (opTok.kind === TK.MINUS ? "MINUS" : "NOT") as unknown as UnaryOp;
      return { kind: "Unary", op, rhs };
    }
    return this.call();
  }

  private call(): Expr {
    let expr = this.primary();

    while (true) {
      if (this.match(TK.LPAREN)) {
        const args: Expr[] = [];
        if (!this.check(TK.RPAREN)) {
          do {
            args.push(this.expression());
          } while (this.match(TK.COMMA));
        }
        this.consume(TK.RPAREN, "Expected ')' after arguments.");
        expr = { kind: "Call", callee: expr, args };
        continue;
      }
      break;
    }

    return expr;
  }

  private primary(): Expr {
    if (this.match(TK.NUMBER)) {
      const t = this.previous();
      return { kind: "Num", value: Number(t.literal ?? t.lexeme) };
    }
    if (this.match(TK.STRING)) {
      const t = this.previous();
      return { kind: "Str", value: String(t.literal ?? t.lexeme) };
    }
    if (this.match(TK.IDENT)) {
      return { kind: "Ident", name: this.previous().lexeme };
    }

    if (this.match(TK.LPAREN)) {
      const expr = this.expression();
      this.consume(TK.RPAREN, "Expected ')' after expression.");
      return { kind: "Group", expr };
    }

    throw this.error(this.current(), "Expected expression.");
  }

  // =====================
  // Helpers / Error recovery
  // =====================
  private match(...kinds: TokenKind[]): boolean {
    for (const k of kinds) {
      if (this.check(k)) {
        this.advance();
        return true;
      }
    }
    return false;
  }

  private consume(kind: TokenKind, message: string): Token {
    if (this.check(kind)) return this.advance();
    throw this.error(this.current(), message);
  }

  private check(kind: TokenKind): boolean {
    if (this.isAtEnd()) return false;
    return this.current().kind === kind;
  }

  private advance(): Token {
    if (!this.isAtEnd()) this.i++;
    return this.previous();
  }

  private isAtEnd(): boolean {
    return this.current().kind === TK.EOF;
  }

  private current(): Token {
    const tok = this.tokens[this.i];
    if (!tok) throw new Error("Parser invariant violated: missing EOF token");
    return tok;
  }

  private previous(): Token {
    const tok = this.tokens[this.i - 1];
    if (!tok) throw new Error("Parser invariant violated: previous() before start");
    return tok;
  }

  private peek(): Token | undefined {
    return this.tokens[this.i + 1];
  }

  private error(token: Token, message: string): ParseError {
    return new ParseError(token, message);
  }

  private synchronize(): void {
    this.advance();

    while (!this.isAtEnd()) {
      if (this.previous().kind === TK.SEMICOLON) return;

      switch (this.current().kind) {
        case TK.LET:
        case TK.FUNC:
        case TK.IF:
        case TK.WHILE:
          return; // ✅ important: stop syncing at a likely statement boundary
        default:
          break;
      }

      this.advance();
    }
  }
}
