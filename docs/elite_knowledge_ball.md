## /lexer
contains lexer.ts and token.ts
### lexer.ts
gets a string and returns an array of Token
### token.ts
stores all type of tokens, keyword list

## /parser
contains parser.ts and ast.ts
### parser.ts
gets an array of Token and returns an array of Value, Expr, Stmt
### ast.ts
stores all type of Value, Expr, Stmt

## /runtime
contains interp.ts and natives.ts
### interp.ts
gets an array containing the AST and interprets the array into outputs
### native.ts
stores all the standard libarary function