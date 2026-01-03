import { Lexer } from "./lexer";
import { Parser } from "./parser";
import { inspect } from "util";


const args =
  Bun.argv[1]?.endsWith(".ts")
    ? Bun.argv.slice(2)
    : Bun.argv.slice(1);
// console.log(args)


if (!args[0]) {
    console.error("[YEET ERROR] No files were given to YEET.");
    process.exit(1)
} else {
    const srcFile = Bun.file(args[0]);

    if (!(await srcFile.exists())) {
        console.error(`[YEET ERROR] File '${args[0]}' does not exist.`);
        process.exit(1);
    }

    const src = await srcFile.text();

    let yeetLexer = new Lexer(src);
    let yeetTokens = yeetLexer.lex();

    let yeetParser = new Parser(yeetTokens);
    let yeetAst = yeetParser.parseProgram();

    
    console.log(inspect(yeetAst, {
        depth: null, // infinite depth
        colors: true,
        maxArrayLength: null,
        breakLength: Infinity
    }));
}
