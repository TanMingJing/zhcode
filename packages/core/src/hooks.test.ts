import { describe, it, expect } from 'vitest';
import { Tokenizer } from '../src/tokenizer';
import { Parser } from '../src/parser';
import { Transpiler } from '../src/transpiler';

describe('React Hooks Support', () => {
  const compile = (code: string): string => {
    const tokenizer = new Tokenizer(code);
    const tokens = tokenizer.tokenize();
    const parser = new Parser(tokens);
    const ast = parser.parse();
    const transpiler = new Transpiler();
    return transpiler.transpile(ast);
  };

  it('should recognize React.useState hook', () => {
    const code = '令 [count, setCount] = React.useState(0);';
    const result = compile(code);
    expect(result).toContain('React.useState');
    expect(result).toContain('count');
    expect(result).toContain('setCount');
  });

  it('should support array destructuring syntax', () => {
    const code = '令 [a, b] = getValue();';
    const result = compile(code);
    expect(result).toContain('[a, b]');
    expect(result).toContain('getValue()');
  });

  it('should support destructuring with Chinese names', () => {
    const code = '令 [状态, 设状态] = React.useState(初值);';
    const result = compile(code);
    expect(result).toContain('[状态, 设状态]');
    expect(result).toContain('React.useState');
    expect(result).toContain('初值');
  });

  it('should support hook in component function', () => {
    const code = `函数 计数器() {
      令 [count, setCount] = React.useState(0);
      返回 <div>{count}</div>;
    }`;
    const result = compile(code);
    expect(result).toContain('function 计数器()');
    expect(result).toContain('React.useState');
    expect(result).toContain('React.createElement');
  });

  it('should support useEffect call', () => {
    const code = `React.useEffect(handleEffect, []);`;
    const result = compile(code);
    expect(result).toContain('React.useEffect');
    expect(result).toContain('handleEffect');
  });

  it('should support multiple useState in one function', () => {
    const code = `函数 表单() {
      令 [name, setName] = React.useState("");
      令 [email, setEmail] = React.useState("");
      返回 <form></form>;
    }`;
    const result = compile(code);
    expect(result).toContain('React.useState');
    expect(result).toMatch(/React\.useState.*React\.useState/s);
    expect(result).toContain('name');
    expect(result).toContain('email');
  });

  it('should support setState in expression', () => {
    const code = `令 [count, setCount] = React.useState(0);
    令 result = setCount(count + 1);`;
    const result = compile(code);
    expect(result).toContain('setCount(count + 1)');
  });

  it('should support hooks with member expressions', () => {
    const code = `令 [state, setState] = obj.method();`;
    const result = compile(code);
    expect(result).toContain('[state, setState]');
    expect(result).toContain('obj.method()');
  });

  it('should support nested destructuring values', () => {
    const code = `令 [值1, 值2, 值3] = getValue();`;
    const result = compile(code);
    expect(result).toContain('[值1, 值2, 值3]');
  });

  it('should support useEffect with dependency array', () => {
    const code = `React.useEffect(callback, [依赖]);`;
    const result = compile(code);
    expect(result).toContain('React.useEffect');
    expect(result).toContain('callback');
    expect(result).toContain('[依赖]');
  });
});

