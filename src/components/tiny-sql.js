/* tiny-sql — a minimal SQL evaluator for the homepage sample lesson.
 *
 * NOT a real SQL engine. Supports only what the sample lesson needs:
 *   SELECT * | SELECT col1, col2, ...
 *   FROM <table>
 *   WHERE <expr> [AND|OR <expr>] ...
 *     where expr ::= col OP value  and OP ::= = != <> < <= > >=
 *     values are numbers or 'quoted strings' (single quotes)
 *   ORDER BY col [ASC|DESC]
 *   LIMIT <n>
 *
 * Tables are plain JS arrays of objects. Case-insensitive keywords.
 * Errors are thrown with useful messages the UI surfaces to learners.
 *
 * This exists so the homepage sample lesson has zero new dependencies
 * and works offline. Real atlases use sql.js (real SQLite) for the deep dive.
 */

const KW_RE = /^(select|from|where|order|by|and|or|asc|desc|limit)$/i;

// ─── Tokenizer ─────────────────────────────────────────────────────
function tokenize(sql) {
  const tokens = [];
  let i = 0;
  const s = sql.trim();
  while (i < s.length) {
    const c = s[i];
    if (/\s/.test(c)) { i++; continue; }
    // single-quoted string
    if (c === "'") {
      let end = s.indexOf("'", i + 1);
      if (end === -1) throw new Error(`Unclosed string starting at position ${i}`);
      tokens.push({ type: 'str', value: s.slice(i + 1, end) });
      i = end + 1;
      continue;
    }
    // number
    if (/[0-9]/.test(c)) {
      let j = i;
      while (j < s.length && /[0-9.]/.test(s[j])) j++;
      tokens.push({ type: 'num', value: parseFloat(s.slice(i, j)) });
      i = j;
      continue;
    }
    // operators
    if (c === '<' || c === '>' || c === '!' || c === '=') {
      const two = s.slice(i, i + 2);
      if (two === '<=' || two === '>=' || two === '!=' || two === '<>') {
        tokens.push({ type: 'op', value: two === '<>' ? '!=' : two });
        i += 2;
        continue;
      }
      tokens.push({ type: 'op', value: c });
      i++;
      continue;
    }
    // punctuation
    if (c === ',' || c === '*' || c === '(' || c === ')') {
      tokens.push({ type: 'punct', value: c });
      i++;
      continue;
    }
    // identifier or keyword
    if (/[A-Za-z_]/.test(c)) {
      let j = i;
      while (j < s.length && /[A-Za-z0-9_]/.test(s[j])) j++;
      const word = s.slice(i, j);
      tokens.push({ type: KW_RE.test(word) ? 'kw' : 'id', value: word.toLowerCase() });
      i = j;
      continue;
    }
    throw new Error(`Unexpected character '${c}' at position ${i}`);
  }
  return tokens;
}

// ─── Parser + evaluator ────────────────────────────────────────────
export function runQuery(sql, tables) {
  const tokens = tokenize(sql);
  if (tokens.length === 0) throw new Error('Empty query — write some SQL to run.');

  let pos = 0;
  const peek = () => tokens[pos];
  const consume = () => tokens[pos++];
  const expectKw = (kw) => {
    const t = peek();
    if (!t || t.type !== 'kw' || t.value !== kw) {
      throw new Error(`Expected '${kw.toUpperCase()}' but got ${t ? `'${t.value}'` : 'end of query'}`);
    }
    return consume();
  };

  // SELECT
  expectKw('select');
  const cols = [];
  if (peek() && peek().type === 'punct' && peek().value === '*') {
    consume();
    cols.push('*');
  } else {
    while (true) {
      const t = consume();
      if (!t || t.type !== 'id') throw new Error(`Expected column name after SELECT`);
      cols.push(t.value);
      if (peek() && peek().type === 'punct' && peek().value === ',') { consume(); continue; }
      break;
    }
  }

  // FROM
  expectKw('from');
  const tblTok = consume();
  if (!tblTok || tblTok.type !== 'id') throw new Error(`Expected table name after FROM`);
  const table = tables[tblTok.value];
  if (!table) {
    const names = Object.keys(tables).join(', ');
    throw new Error(`Unknown table '${tblTok.value}'. Available: ${names}`);
  }

  // Optional WHERE
  let whereExpr = null;
  if (peek() && peek().type === 'kw' && peek().value === 'where') {
    consume();
    whereExpr = parseWhere();
  }

  function parseWhere() {
    let node = parseComparison();
    while (peek() && peek().type === 'kw' && (peek().value === 'and' || peek().value === 'or')) {
      const op = consume().value;
      const right = parseComparison();
      node = { type: 'logical', op, left: node, right };
    }
    return node;
  }

  function parseComparison() {
    const colTok = consume();
    if (!colTok || colTok.type !== 'id') throw new Error(`Expected column name in WHERE`);
    const opTok = consume();
    if (!opTok || opTok.type !== 'op') throw new Error(`Expected an operator (=, !=, <, <=, >, >=) after '${colTok.value}'`);
    const valTok = consume();
    if (!valTok || (valTok.type !== 'num' && valTok.type !== 'str')) {
      throw new Error(`Expected a value after '${opTok.value}'. Use quotes for text: 'Engineering'`);
    }
    return { type: 'cmp', col: colTok.value, op: opTok.value, value: valTok.value };
  }

  // Optional ORDER BY
  let orderCol = null;
  let orderDir = 'asc';
  if (peek() && peek().type === 'kw' && peek().value === 'order') {
    consume();
    expectKw('by');
    const c = consume();
    if (!c || c.type !== 'id') throw new Error(`Expected column name after ORDER BY`);
    orderCol = c.value;
    if (peek() && peek().type === 'kw' && (peek().value === 'asc' || peek().value === 'desc')) {
      orderDir = consume().value;
    }
  }

  // Optional LIMIT
  let limit = null;
  if (peek() && peek().type === 'kw' && peek().value === 'limit') {
    consume();
    const n = consume();
    if (!n || n.type !== 'num') throw new Error(`Expected a number after LIMIT`);
    limit = Math.floor(n.value);
  }

  // If there's anything left, complain
  if (pos < tokens.length) {
    throw new Error(`Unexpected token '${tokens[pos].value}' after query end`);
  }

  // ─── Evaluate ───
  const evalWhere = (row, expr) => {
    if (!expr) return true;
    if (expr.type === 'logical') {
      const l = evalWhere(row, expr.left);
      const r = evalWhere(row, expr.right);
      return expr.op === 'and' ? (l && r) : (l || r);
    }
    if (expr.type === 'cmp') {
      const v = row[expr.col];
      if (v === undefined) {
        const rowCols = Object.keys(row).join(', ');
        throw new Error(`Column '${expr.col}' does not exist. Available: ${rowCols}`);
      }
      switch (expr.op) {
        case '=':  return v == expr.value;
        case '!=': return v != expr.value;
        case '<':  return v <  expr.value;
        case '<=': return v <= expr.value;
        case '>':  return v >  expr.value;
        case '>=': return v >= expr.value;
      }
    }
    return true;
  };

  let rows = table.filter(r => evalWhere(r, whereExpr));

  if (orderCol) {
    rows = [...rows].sort((a, b) => {
      const av = a[orderCol], bv = b[orderCol];
      if (av === bv) return 0;
      const cmp = av < bv ? -1 : 1;
      return orderDir === 'desc' ? -cmp : cmp;
    });
  }

  if (limit !== null) rows = rows.slice(0, limit);

  if (cols.length === 1 && cols[0] === '*') return rows;
  return rows.map(r => Object.fromEntries(cols.map(c => [c, r[c]])));
}
