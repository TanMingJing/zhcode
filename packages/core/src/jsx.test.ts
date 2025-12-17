import { describe, it, expect } from 'vitest';
import { Tokenizer } from '../src/tokenizer';
import { Parser } from '../src/parser';
import { Transpiler } from '../src/transpiler';

describe('JSX Support', () => {
  const compile = (code: string): string => {
    const tokenizer = new Tokenizer(code);
    const tokens = tokenizer.tokenize();
    const parser = new Parser(tokens);
    const ast = parser.parse();
    const transpiler = new Transpiler();
    return transpiler.transpile(ast);
  };

  it('should transpile simple JSX element', () => {
    const code = '令 app = <div>Hello</div>;';
    const result = compile(code);
    expect(result).toContain('React.createElement("div"');
    expect(result).toContain('"Hello"');
  });

  it('should transpile JSX with attributes', () => {
    const code = '令 btn = <Button onClick={handleClick}>Click</Button>;';
    const result = compile(code);
    expect(result).toContain('React.createElement("Button"');
    expect(result).toContain('onClick: handleClick');
    expect(result).toContain('"Click"');
  });

  it('should transpile self-closing JSX', () => {
    const code = '令 input = <input type="text" />;';
    const result = compile(code);
    expect(result).toContain('React.createElement("input"');
    expect(result).toContain('type: "text"');
    expect(result).not.toContain(', )');
  });

  it('should transpile JSX with multiple attributes', () => {
    const code = '令 img = <img src="pic.jpg" alt="photo" />;';
    const result = compile(code);
    expect(result).toContain('React.createElement("img"');
    expect(result).toContain('src: "pic.jpg"');
    expect(result).toContain('alt: "photo"');
  });

  it('should transpile nested JSX elements', () => {
    const code = `令 form = (
      <form>
        <input type="text" />
        <Button>Submit</Button>
      </form>
    );`;
    const result = compile(code);
    expect(result).toContain('React.createElement("form"');
    expect(result).toContain('React.createElement("input"');
    expect(result).toContain('React.createElement("Button"');
  });

  it('should transpile JSX with expression container', () => {
    const code = '令 count = <span>{counter}</span>;';
    const result = compile(code);
    expect(result).toContain('React.createElement("span"');
    expect(result).toContain('counter');
  });

  it('should transpile JSX with Chinese text', () => {
    const code = '令 label = <label>姓名</label>;';
    const result = compile(code);
    expect(result).toContain('React.createElement("label"');
  });

  it('should transpile JSX with className attribute', () => {
    const code = '令 div = <div className="container">Content</div>;';
    const result = compile(code);
    expect(result).toContain('className: "container"');
  });

  it('should transpile JSX with boolean attribute', () => {
    const code = '令 btn = <Button disabled={true}>Disabled</Button>;';
    const result = compile(code);
    expect(result).toContain('disabled: true');
  });

  it('should transpile JSX with multiple children', () => {
    const code = `令 list = (
      <div>
        <h1>Title</h1>
        <p>Paragraph</p>
        <button>Button</button>
      </div>
    );`;
    const result = compile(code);
    expect(result).toContain('React.createElement("h1"');
    expect(result).toContain('React.createElement("p"');
    expect(result).toContain('React.createElement("button"');
  });

  it('should transpile deeply nested JSX', () => {
    const code = `令 ui = (
      <div className="wrapper">
        <header>
          <nav>
            <a href="/">Home</a>
          </nav>
        </header>
        <main>
          <Button>Action</Button>
        </main>
      </div>
    );`;
    const result = compile(code);
    expect(result).toContain('React.createElement("div"');
    expect(result).toContain('React.createElement("header"');
    expect(result).toContain('React.createElement("nav"');
    expect(result).toContain('React.createElement("a"');
  });

  it('should transpile JSX with conditional rendering', () => {
    const code = `令 render = show ? <div>Visible</div> : <div>Hidden</div>;`;
    const result = compile(code);
    expect(result).toContain('React.createElement("div"');
  });
});
