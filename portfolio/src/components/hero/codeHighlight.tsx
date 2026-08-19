// Tiny, dependency-free syntax highlighter. Tokenizes a snippet and returns
// colored spans. Good enough for the fixed code shown in the hero cards; not a
// full parser. Covers rust / ts / sql / nginx with a shared scanner.

export type Lang = "rust" | "ts" | "sql" | "nginx";

type TokenKind =
  | "comment"
  | "keyword"
  | "string"
  | "number"
  | "type"
  | "attr"
  | "func"
  | "plain"
  | "punct";

interface Token {
  kind: TokenKind;
  value: string;
}

// Warm, orange-forward palette. Keeps the whole thing 2-tone like the reference.
const COLOR: Record<TokenKind, string> = {
  comment: "#565B66",
  keyword: "#FF8F40",
  string: "#E6B450",
  number: "#E6B450",
  type: "#E6B450",
  attr: "#FF8F40",
  func: "#D7D3CC",
  plain: "#BFBDB6",
  punct: "#736F6A",
};

const KEYWORDS: Record<Lang, Set<string>> = {
  rust: new Set([
    "async", "fn", "let", "mut", "struct", "impl", "trait", "pub", "use",
    "mod", "match", "if", "else", "for", "while", "loop", "return", "await",
    "move", "enum", "const", "static", "where", "dyn", "ref", "as", "in",
    "Ok", "Err", "Some", "None", "true", "false", "self",
  ]),
  ts: new Set([
    "async", "function", "const", "let", "var", "return", "await", "if",
    "else", "for", "while", "import", "export", "from", "interface", "type",
    "class", "extends", "new", "throw", "try", "catch", "this", "true",
    "false", "null", "undefined", "void",
  ]),
  sql: new Set([
    "CREATE", "TABLE", "PRIMARY", "KEY", "NOT", "NULL", "SELECT", "FROM",
    "WHERE", "INSERT", "INTO", "VALUES", "UPDATE", "SET", "DELETE", "UUID",
    "TEXT", "DATE", "INT", "INTEGER", "VARCHAR", "DEFAULT", "REFERENCES",
    "FOREIGN", "ON", "AS", "TIMESTAMP", "BOOLEAN",
  ]),
  nginx: new Set([
    "upstream", "server", "least_conn", "proxy_pass", "listen", "location",
    "http", "events", "worker_processes",
  ]),
};

function tokenize(code: string, lang: Lang): Token[] {
  const out: Token[] = [];
  const len = code.length;
  const keywords = KEYWORDS[lang];
  const commentPrefix = lang === "sql" ? "--" : lang === "nginx" ? "#" : "//";
  let i = 0;

  const push = (kind: TokenKind, value: string) => {
    if (value) out.push({ kind, value });
  };

  while (i < len) {
    const c = code[i];

    // whitespace
    if (/\s/.test(c)) {
      let j = i + 1;
      while (j < len && /\s/.test(code[j])) j++;
      push("plain", code.slice(i, j));
      i = j;
      continue;
    }

    // line comment
    if (code.startsWith(commentPrefix, i)) {
      let j = code.indexOf("\n", i);
      if (j < 0) j = len;
      push("comment", code.slice(i, j));
      i = j;
      continue;
    }

    // rust attribute #[...]
    if (lang === "rust" && c === "#" && code[i + 1] === "[") {
      let j = code.indexOf("]", i);
      j = j < 0 ? len : j + 1;
      push("attr", code.slice(i, j));
      i = j;
      continue;
    }

    // string literal
    if (c === '"' || c === "'") {
      let j = i + 1;
      while (j < len) {
        if (code[j] === "\\") {
          j += 2;
          continue;
        }
        if (code[j] === c) {
          j++;
          break;
        }
        j++;
      }
      push("string", code.slice(i, j));
      i = j;
      continue;
    }

    // number
    if (/[0-9]/.test(c)) {
      let j = i + 1;
      while (j < len && /[0-9._]/.test(code[j])) j++;
      push("number", code.slice(i, j));
      i = j;
      continue;
    }

    // word (identifier / keyword / type / call)
    if (/[A-Za-z_]/.test(c)) {
      let j = i + 1;
      while (j < len && /[A-Za-z0-9_]/.test(code[j])) j++;
      const word = code.slice(i, j);
      let k = j;
      while (k < len && code[k] === " ") k++;
      const next = code[k];

      let kind: TokenKind = "plain";
      const lookup = lang === "sql" ? word.toUpperCase() : word;
      if (keywords.has(lookup)) kind = "keyword";
      else if (next === "(") kind = "func";
      else if (/^[A-Z]/.test(word)) kind = "type";

      push(kind, word);
      i = j;
      continue;
    }

    // punctuation / anything else, single char
    push("punct", c);
    i++;
  }

  return out;
}

export function highlightCode(code: string, lang: Lang) {
  return tokenize(code, lang).map((t, idx) => (
    <span key={idx} style={{ color: COLOR[t.kind] }}>
      {t.value}
    </span>
  ));
}

// Same highlighter, but split per line so each line can be animated on its own.
// No multi-line strings/comments in the hero snippets, so tokenizing line-by-line
// is safe. Returns one array of spans per source line.
export function highlightLines(code: string, lang: Lang) {
  return code.split("\n").map((line) =>
    tokenize(line, lang).map((t, idx) => (
      <span key={idx} style={{ color: COLOR[t.kind] }}>
        {t.value}
      </span>
    )),
  );
}
