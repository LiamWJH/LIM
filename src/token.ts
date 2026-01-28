export const TK = {
  LET: "LET",
  AND: "AND",
  OR: "OR",
  NOT: "NOT",
  FUNC: "FUNC",
  EXPORT: "EXPORT",
  WHILE: "WHILE",
  IF: "IF",
  ELSE: "ELSE",

  IDENT: "IDENT",
  NUMBER: "NUMBER",
  STRING: "STRING",


  EQUAL: "EQUAL",
  NOTEQ: "NOTEQ",
  LT: "LT",
  GT: "GT",
  LTE: "LTE",
  GTE: "GTE",

  ASSIGN: "ASSIGN",
  PLUS: "PLUS",
  MINUS: "MINUS",
  STAR: "STAR",
  SLASH: "SLASH",

  PLUS_ASSIGN: "PLUS_ASSIGN",
  MINUS_ASSIGN: "MINUS_ASSIGN",
  STAR_ASSIGN: "STAR_ASSIGN",
  SLASH_ASSIGN: "SLASH_ASSIGN",

  ARROW: "ARROW",
  BANG: "BANG",

  LPAREN: "LPAREN",
  RPAREN: "RPAREN",
  LBRACE: "LBRACE",
  RBRACE: "RBRACE",
  LBRACKET: "LBRACKET",
  RBRACKET: "RBRACKET",

  COMMA: "COMMA",
  DOT: "DOT",
  SEMICOLON: "SEMICOLON",
  COLON: "COLON",

  COMMENT: "COMMENT",
  RETURN: "RETURN",
  EOF: "EOF",
} as const;

export type TokenKind = typeof TK[keyof typeof TK];

export type Token = {
  kind: TokenKind;
  lexeme: string;
  literal?: number | string;
};

export const KEYWORDS: Record<string, TokenKind> = {
  let: TK.LET,
  if: TK.IF,
  else: TK.ELSE,
  while: TK.WHILE,
  and: TK.AND,
  or: TK.OR,
  not: TK.NOT,
  func: TK.FUNC,
  return: TK.RETURN,
  export: TK.EXPORT,
};
