import { Lexer } from "./lexer/lexer";
import { Parser } from "./parser/parser";
import util from "node:util";
import { Runtime } from "./runtime/interp";


const args =
  Bun.argv[1]?.endsWith(".ts")
    ? Bun.argv.slice(2)
    : Bun.argv.slice(1);
// console.log(args)


if (!args[0]) {
    console.error("[lim ERROR] No files were given to lim.");
    process.exit(1)
} else {
    const srcFile = Bun.file(args[0]);

    if (!(await srcFile.exists())) {
        console.error(`[lim ERROR] File '${args[0]}' does not exist.`);
        process.exit(1);
    }

    const src = await srcFile.text();

    let limLexer = new Lexer(src);
    let limTokens = limLexer.lex();


    let limParser = new Parser(limTokens);
    let limAst = limParser.parseProgram();
    // console.log(
    //     util.inspect(limTokens, {
    //         depth: null,          // ← no recursion limit
    //         colors: true,
    //         maxArrayLength: null,
    //         breakLength: 120,
    // }));
    if (limParser.errors.length) {
        for (const err of limParser.errors) {
            console.error(`[Code Pattern Error] ${err.message} at word type ${err.token.kind}, word '${err.token.lexeme}'`);
        }
        process.exit(1);
    }

/**
    console.log("TOKENS:");
    console.log(
    util.inspect(limTokens, {
        depth: null,          // ← no recursion limit <
        colors: true,
        maxArrayLength: null,
        breakLength: 120,
    }));
    console.log("AST:")
    console.log(
    util.inspect(limAst, {
        depth: null,          // ← no recursion limit
        colors: true,
        maxArrayLength: null,
        breakLength: 120,
    }));
*/


    let limRuntime = new Runtime();
    limRuntime.run(limAst);
}
