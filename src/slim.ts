import { Lexer } from "./lexer";
import { Parser } from "./parser";
import util from "node:util";
import { Runtime } from "./interp";


const args =
  Bun.argv[1]?.endsWith(".ts")
    ? Bun.argv.slice(2)
    : Bun.argv.slice(1);
// console.log(args)


if (!args[0]) {
    console.error("[slim ERROR] No files were given to SLIM.");
    process.exit(1)
} else {
    const srcFile = Bun.file(args[0]);

    if (!(await srcFile.exists())) {
        console.error(`[slim ERROR] File '${args[0]}' does not exist.`);
        process.exit(1);
    }

    const src = await srcFile.text();

    let slimLexer = new Lexer(src);
    let slimTokens = slimLexer.lex();

    let slimParser = new Parser(slimTokens);
    let slimAst = slimParser.parseProgram();

    if (slimParser.errors.length) {
        for (const err of slimParser.errors) {
            console.error(`[Code Pattern Error] ${err.message} at word type ${err.token.kind}, word ${err.token.lexeme}`);
        }
        process.exit(1);
    }

    /**
    console.log("TOKENS:");
    console.log(
    util.inspect(slimTokens, {
        depth: null,          // ← no recursion limit
        colors: true,
        maxArrayLength: null,
        breakLength: 120,
    })
    );
    console.log("AST:");
    console.log(
    util.inspect(slimAst, {
        depth: null,          // ← no recursion limit
        colors: true,
        maxArrayLength: null,
        breakLength: 120,
    })
    );
     */


    let slimRuntime = new Runtime();
    slimRuntime.run(slimAst);
}
