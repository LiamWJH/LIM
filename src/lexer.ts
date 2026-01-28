// the lexer has a Lexer class which returns a array of Token

import { KEYWORDS } from "./token";
import type { Token, TokenKind } from "./token";

export class Lexer {
    private pos = 0;
    private line = 1;
    private col = 0;
    private src = "";


    constructor(src: string) {
        this.src = src;
    }


    private peekN(n: number = 0): string {
        return this.src[this.pos + n] ?? "\0";
    }

    private peek(): string {
        return this.peekN(0);
    }

    private charAt(i: number): string {
        return this.src[i] ?? "\0";
    }


    private advance(): string {
        let c = this.src[this.pos];

        if (c == "\n") {
            this.line++;
            this.col = 0;
        } else {
            this.col++;
        }
        this.pos++;

        return c ?? "\0";
    }

    private isAtEnd(): boolean {

        return this.pos >= this.src.length;
    }


    private isAlpha(c: string): boolean {
        const n = c.charCodeAt(0);

        return (n >= 65 && n <= 90) || (n >= 97 && n <= 122);
    }

    private isAlnum(c: string): boolean {
        const n = c.charCodeAt(0);

        return (
              (n >= 65 && n <= 90) ||   // A-Z
              (n >= 97 && n <= 122) ||  // a-z
              (n >= 48 && n <= 57) ||   // 0-9
              c === "_"
          );
    }

    private isNumber(c: string): boolean {
        const n = c.charCodeAt(0);

        return n >= 48 && n <= 57;
    }

    private isQuote(c: string): [boolean, string | null] {
        if (c == "'" || c == '"') return [true, c];

        return [false, null];
    }

    private parseString(raw: string): string {
        return raw
            .replace(/\\n/g, "\n")
            .replace(/\\t/g, "\t")
            .replace(/\\"/g, '"')
            .replace(/\\\\/g, "\\");
    }


    public lex(): Token[] {
        let out: Token[] = [];

        while (!this.isAtEnd()) {
            let ch: string = this.advance();

            if (this.isNumber(ch)) {
                let i = this.pos;
                const parts: string[] = [ch];
                let sawDot = false;

                while (i < this.src.length) {
                  const c = this.charAt(i);

                  if (this.isNumber(c)) {
                    parts.push(c);
                    i++;
                    continue;
                  } else if (!sawDot && c === "." && this.isNumber(this.charAt(i + 1))) {
                    sawDot = true;
                    parts.push(c);
                    i++;
                    continue;
                  }

                  break;
                }

                const _buf = parts.join("");
                let _bufLiteral: number | null = null;
                if (sawDot) {
                    _bufLiteral = parseFloat(_buf);
                } else {
                    _bufLiteral = parseInt(_buf, 10);
                }

                out.push({
                    kind: "NUMBER",
                    lexeme: _buf,
                    literal: _bufLiteral,
                });

                this.pos = i;
                this.col += parts.length;

                continue;
            }

            if (this.isAlpha(ch)) {
                let i = this.pos;
                const parts: string[] = [ch];

                while (i < this.src.length) {
                  const c = this.charAt(i);

                  if (this.isAlnum(c)) {
                    parts.push(c);
                    i++;
                    continue;
                  } else {
                    break;
                  }
                }

                const _buf = parts.join("");

                const keywordKind = KEYWORDS[_buf];

                out.push({
                kind: keywordKind ?? "IDENT",
                lexeme: _buf,
                });


                this.pos = i;
                this.col += parts.length;

                continue;
            }

            const [isQuote, quoteType] = this.isQuote(ch);
            if (isQuote) {
                let i = this.pos;
                const parts: string[] = [];

                while (i < this.src.length) {
                    const c = this.charAt(i);

                    if (c === quoteType) break;

                    if (c === "\\") {
                        const n = this.charAt(i + 1);
                        switch (n) {
                        case "n":  parts.push("\\n");  break;
                        case "t":  parts.push("\\t");  break;
                        case '"':  parts.push('\\"');  break;
                        case "\\": parts.push("\\\\"); break;
                        default:   parts.push("\\" + n); break;
                        }
                        i += 2;
                        continue;
                    }

                    parts.push(c);
                    i++;
                    }

                const _buf = parts.join("");
                let _bufLiteral: string = this.parseString(_buf);

                out.push({
                    kind: "STRING",
                    lexeme: _buf,
                    literal: _bufLiteral,
                });

                this.pos = i+1;
                this.col += parts.length+1;

                continue;
            }

            if (ch === "=") {
                if (this.peek() === "=") {
                    this.advance();
                    out.push({
                        kind: "EQUAL",
                        lexeme: "==",
                    })
                    continue;
                } else if (this.peek() === ">") {
                    this.advance();
                    out.push({
                        kind: "ARROW",
                        lexeme: "=>",
                    })
                    continue;
                } else {
                    out.push({
                        kind: "ASSIGN",
                        lexeme: "=",
                    });
                    continue;
                }
            }

            if (ch === "<") {
                if (this.peek() === "=") {
                    this.advance();
                    out.push({
                        kind: "LTE",
                        lexeme: "<=",
                    })
                    continue;
                } else {
                    out.push({
                        kind: "LT",
                        lexeme: "<",
                    })
                    continue;
                }
            }

            if (ch === ">") {
                if (this.peek() === "=") {
                    this.advance();
                    out.push({
                        kind: "GTE",
                        lexeme: ">=",
                    })
                    continue;
                } else {
                    out.push({
                        kind: "GT",
                        lexeme: ">",
                    })
                    continue;
                }
            }

            if (ch === "!") {
                if (this.peek() === "=") {
                    this.advance();
                    out.push({
                        kind: "NOTEQ",
                        lexeme: "!=",
                    })
                    continue;
                } else {
                    out.push({
                        kind: "BANG",
                        lexeme: "!",
                    });
                }
            }

            if (ch === "*") {
                if (this.peek() === "=") {
                    this.advance();
                    out.push({
                        kind: "STAR_ASSIGN",
                        lexeme: "*=",
                    });
                    continue;
                } else {
                    out.push({
                        kind: "STAR",
                        lexeme: "*",
                    });
                    continue;
                }
            }

            if (ch === "/") {
                if (this.peek() === "=") {
                    this.advance();
                    out.push({
                        kind: "SLASH_ASSIGN",
                        lexeme: "/=",
                    });
                    continue;
                } else {
                    out.push({
                        kind: "SLASH",
                        lexeme: "/",
                    });
                    continue;
                }
            }

            if (ch === "+") {
                if (this.peek() === "=") {
                    this.advance();
                    out.push({
                        kind: "PLUS_ASSIGN",
                        lexeme: "+=",
                    });
                    continue;
                } else {
                    out.push({
                        kind: "PLUS",
                        lexeme: "+",
                    });
                    continue;
                }
            }

            if (ch === "-") {
                if (this.peek() === "=") {
                    this.advance();
                    out.push({
                        kind: "MINUS_ASSIGN",
                        lexeme: "-=",
                    });
                    continue;
                } else {
                    out.push({
                        kind: "MINUS",
                        lexeme: "-",
                    });
                    continue;
                }
            }

            if (ch === " " || ch === "\t" || ch === "\r" || ch === "\n") continue;

            if (ch === "(") out.push({kind: "LPAREN", lexeme: "("});
            if (ch === ")") out.push({kind: "RPAREN", lexeme: ")"});

            if (ch === "{") out.push({kind: "LBRACE", lexeme: "{"});
            if (ch === "}") out.push({kind: "RBRACE", lexeme: "}"});

            if (ch === "[") out.push({kind: "LBRACKET", lexeme: "["});
            if (ch === "]") out.push({kind: "RBRACKET", lexeme: "]"});

            if (ch === ",") out.push({kind: "COMMA", lexeme: ","});

            if (ch === ".") out.push({kind: "DOT", lexeme: "."});

            if (ch === ";") out.push({kind: "SEMICOLON", lexeme: ";"});
            if (ch === ":") out.push({kind: "COLON", lexeme: ":"});

            // if (ch === "|") out.push({kind: "SEMICOLON", lexeme: ";"}); ADD LATER


            if (ch == "#") {
                let i = this.pos;
                const parts: string[] = [];

                while (!this.isAtEnd()) {
                    const c = this.advance();
                    if (!(c === "#")) {
                        parts.push(c);
                    } else {
                        break;
                    }
                }

                let _buf = parts.join("");

                out.push({kind: "COMMENT", lexeme: _buf})
            }
        }
        out.push({ kind:"EOF", lexeme: "EOF" });

        return out;
    }
}