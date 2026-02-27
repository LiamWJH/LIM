# elite_knowledge_ball.md - a guide to understand the language internal

## /lexer

Contains lexer.ts and token.ts

### lexer.ts

Gets a string and returns an array of Token

### token.ts

Stores all type of tokens, keyword list

## /parser

Contains parser.ts and ast.ts

### parser.ts

Gets an array of Token and returns an array of Value, Expr, Stmt

### ast.ts

Stores all type of Value, Expr, Stmt

## /runtime

Contains interp.ts and natives.ts

### interp.ts

Gets an array containing the AST and interprets the array into outputs

### native.ts

Stores all the standard library function

## lim.ts && repl.ts

### lim.ts

A central driver for the lexer, parser, runtime

### repl.ts

Not developed yet, will serve as a repl later on
