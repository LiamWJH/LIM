# LIM
### OPEN TO CONTRIBUTORS!

___
## To install dependencies:
```bash
bun install
```
To run:
```bash
bun run lim.ts foo.lim
```
## Language **highlight**
 - Arrays without homogenic types
 - Curly brace based blocks, ';' seperator
 - scopes (out-scoping/region)
 - true/false/nil as variables (???)
 - precedence following math
 - modular core functions

## **what** and **why** did we take this path?

### Why **interpreted ?**
1. The benefits of an interpreted language is clear: easy dynamic arrays, type freedom, fast improvison.

2. Although there are downsides we believe removing the high entrance barrier of a compiler for an open source project is important,

### Why **typescript ?**
1. Typescript provides the simplicity of javascript, and fills the lack of types. This alone makes making a language mucj more easier.

2. Typescript also is widely used, and learned. Hence draws more contributor.

3. Typescript is also fast compared to other interpreted languages such as python, ruby, lua.

### Why **bun ?** _(The Js/Ts runtime)_
1. Bun uses about 30 - 40 % less memory compared to alternatives like Node.js

2. Bun has almost no config, solving most of "It works on my machine" nonsense

3. Bun can be used with NPM packages without problems

4. _Node feels bloat, its a fact_


---
## Repository insights
![Alt](https://repobeats.axiom.co/api/embed/a8b2c51386e76eb44df19599b0c051a51351683d.svg "Repobeats analytics image")