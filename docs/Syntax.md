# Syntax.md - an intuitive guide to use the language

## Introduction
LIM is a dynamically & strongly typed programming langiage designed for prototyping softwares fast.

It's similar to Python and its design has been influenced by Python, Rust, Typescript.

LIM is a very simple language. Going through this documentation will take you about a day or less, and by the end of it you will have learned the small language.

## Installing LIM from source
The only way to get LIM, is to install it from source. It is fairly simple, and fast.
```bash
git clone https://github.com/LiamWJH/LIM
# !!IMPORTANT!! INSTALL NPM&NODE&BUN AFTER
```

## Getting started
You can make a new file that ends with `.lim` to make a new lim file.

### NOTE!
Since lim is still young and does not have a standalone binary, you must place your files in the `/src` folder of the project

## Hello World
```lim
print("Hello world");
Save this snippet into a file named
```
Save this snippet into a file named `hello.lim`. Now do `bun run hello.lim  ` in the `/src` folder.

## Comments
```lim
# Single line comment #

# Multi
line
comment #
```
Comments in lim always start with a # and ends with a #. The content inside the comment should NOT contain # as that would be indicating the end of the comment.

### NOTE!
Comments are currently BUGGED! If you want to help fix this, make a pull request :D

## Functions
```lim
func add(a,b) {
    return a + b;
}

func sub(a,b) {
    return a - b;
}
print(add(1,2) + sub(4,2));
```
As you can see there are no types involved at all.

Just like in other simple languages, functions cannot be overloaded. This makes the code look cleaner, and fit for prototyping.

## Variables
```lim
let name = "Beluga";
let age = 3;

print(name, age);
```
Variables are declared and initialized with the `let` keyword and `=`. There is no empty declaration as it is almost always unnecessary.

Like Python variables can be declared outside, and inside of a function.

All variables are mutable and there is no exception.

### Out-scoping
```lim
let foo = 1;

func scopetest() {
    let foo = 2;
    return foo;
}
print(scopetest())
```
As most languages always do, if a variable is declared in a more local scope, the variable is out-scoped causing the previous example's output to be 2 instead of 1.

## Types
### Primitive types
```lim
let flag = true;
let text = "hello";
let nums = 1;
let nums2 = 1.2;
let empty = nil;
```
Unlike most languages LIM does not have a direct way to use types as a keyword/expr except for nil.
### Strings
```lim
let s = "Hello";
let s2 = "World";
print(s + s2);

print(len(s));
```
Strings can be concated by the `+` operator and be used as an argument for the `length()` function.

### NOTE!
String currently does not support indexing/slices! If you want to help fix this, make a pull request :D

### Numbers
```lim
let n = 1;
let n2 = 1.2;
```
The number type is both the `int` type and `float` type internally. All operator works in between two numbers.

### NOTE!
The number type currently does not tolerate `_` between integers!  If you want to help fix this, make a pull request :D

### Arrays
```lim
let arr = [1,"a", 3.14, true];
arr = append(arr, "mor");
print(arr, arr[4]);
```
An array is not homogenic in LIM. An array can contaion items with different types.

An element can be appended with the `append()` function like the `golang`.

All arrays start from `0` like all other languages.

### NOTE!
The current array does not have a way to delete an item in a certain index. If you want to help fix this, make a pull request :D

## Statements & expressions

### If
```lim
let a = 1;
let b = 1.2;

if (a < b) {
    print("1 is smaller than 1.2!");
} else {
    print("The universe decided to lolcatz u");
}
```
`if` statement is very intuitive. curly braces, and parentheses were implemented for clarity.

### NOTE!
The `if` statement currently does not have the `else if` | `elif` statement. If you want to help fix this, make a pull request :D

### Let
Already introduced in Variables section, also very intuitive.

### While
```lim
let i = 1;

while (i < 10) {
    print(i);
    i += 1;
}
```
Also very intuitive, one thing to note is that the `for` loop does not exist here as it is replaceable with `while`.

### And & OR & NOT

### NOTE!
BUGGED feature is all under-developed. Lacks parser/runtime support! If you want to help fix this, make a pull request :D

### Func
```lim
func add(a,b) {
    return a + b;
}
```
There are no particular return type definitions for function declarations. Nor are there outstanding exceptions.

### Return
```lim
return 2;
return "b";
return [1,"a"];
```
Note that all of return statements should be in a function or it will cause an error that lacks traceback features :D.

### NOTE!
Read paragraph above, fix that pls.