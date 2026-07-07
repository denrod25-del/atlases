/* SampleLesson — a 3-step interactive SQL lesson embedded on the homepage.
 *
 * The point isn't to teach SQL comprehensively — it's to demonstrate the
 * Atlases teaching pattern: chapter → concept → sandbox → immediate feedback.
 * If a visitor completes this in 90 seconds they've experienced the whole product.
 *
 * Uses tiny-sql (in-JS evaluator, no deps). Real atlases use sql.js.
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, ArrowRight, Check, AlertCircle, RotateCcw, Database, Sparkles } from 'lucide-react';
import { runQuery } from './tiny-sql.js';

// ─── Employees table for the lesson ────────────────────────────────
const EMPLOYEES = [
  { id: 1, name: 'Alice',   department: 'Engineering', salary:  85000, hire_year: 2019 },
  { id: 2, name: 'Bob',     department: 'Sales',       salary:  65000, hire_year: 2020 },
  { id: 3, name: 'Carol',   department: 'Engineering', salary:  95000, hire_year: 2018 },
  { id: 4, name: 'Dan',     department: 'Marketing',   salary:  55000, hire_year: 2021 },
  { id: 5, name: 'Eve',     department: 'Engineering', salary: 110000, hire_year: 2017 },
  { id: 6, name: 'Frank',   department: 'Sales',       salary:  60000, hire_year: 2022 },
  { id: 7, name: 'Grace',   department: 'Engineering', salary:  92000, hire_year: 2019 },
  { id: 8, name: 'Henry',   department: 'Marketing',   salary:  70000, hire_year: 2020 },
];
const TABLES = { employees: EMPLOYEES };

// ─── Steps ─────────────────────────────────────────────────────────
const STEPS = [
  {
    id: 1,
    title: 'See everything',
    prompt: `Every query starts with SELECT. The star means "all columns." FROM tells the database which table. Run this to see all employees:`,
    starter: 'SELECT * FROM employees',
    check: (results) => results.length === EMPLOYEES.length,
    hint: 'Just press Run — the query is already written.',
    success: `That's every row in the table. Real databases scale this to millions of rows and still return in milliseconds. The next step: find the ones you actually want.`,
  },
  {
    id: 2,
    title: 'Filter with WHERE',
    prompt: `WHERE narrows the rows. Numbers use =, <, >, and their friends. Text uses quotes. Modify the query to find employees earning more than 80,000:`,
    starter: `SELECT name, salary FROM employees WHERE salary > __`,
    solution: `SELECT name, salary FROM employees WHERE salary > 80000`,
    check: (results, sql) => {
      if (results.length !== 4) return false;
      const names = results.map(r => r.name).sort();
      const expected = ['Alice', 'Carol', 'Eve', 'Grace'].sort();
      return JSON.stringify(names) === JSON.stringify(expected);
    },
    hint: `Replace the __ with 80000. No comma.`,
    success: `Four engineers — the ones earning above 80k. In production this is how you find the "high-value" segment of anything, from users to orders to logs.`,
  },
  {
    id: 3,
    title: 'Combine + sort + limit',
    prompt: `Real queries combine filters (AND / OR), sort by ORDER BY, and cap rows with LIMIT. Find the top 2 highest-paid engineers:`,
    starter: `SELECT name, salary FROM employees\n WHERE department = 'Engineering'\n ORDER BY salary DESC\n LIMIT __`,
    solution: `SELECT name, salary FROM employees WHERE department = 'Engineering' ORDER BY salary DESC LIMIT 2`,
    check: (results) => {
      if (results.length !== 2) return false;
      return results[0].name === 'Eve' && results[1].name === 'Carol';
    },
    hint: `LIMIT takes a number. You want the top 2, so LIMIT 2.`,
    success: `That's a real production query: filter by department, order by a metric, cap to the top N. The Databases atlas covers indexes (why this is fast), transactions (why it's consistent), and query plans (why it works). But you just wrote real SQL.`,
  },
];

// ─── Table renderer ────────────────────────────────────────────────
function DataTable({ rows, maxRows = 50 }) {
  if (!rows || rows.length === 0) {
    return (
      <div className="border border-zinc-800 bg-zinc-950/60 px-3 py-4 text-zinc-500 text-[12px] text-center italic"
        style={{ fontFamily: 'JetBrains Mono, monospace' }}>
        (query returned 0 rows)
      </div>
    );
  }
  const cols = Object.keys(rows[0]);
  const displayRows = rows.slice(0, maxRows);
  return (
    <div className="border border-zinc-800 bg-zinc-950/60 overflow-x-auto">
      <table className="w-full text-[12px]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
        <thead>
          <tr className="border-b border-zinc-800 bg-zinc-900/50">
            {cols.map(c => (
              <th key={c} className="text-left px-3 py-1.5 text-emerald-300 text-[10px] tracking-[0.15em] uppercase font-semibold">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {displayRows.map((r, i) => (
            <tr key={i} className="border-b border-zinc-900/60 last:border-0">
              {cols.map(c => (
                <td key={c} className="px-3 py-1.5 text-zinc-200">
                  {String(r[c])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length > maxRows && (
        <div className="px-3 py-1.5 text-zinc-500 text-[11px] border-t border-zinc-800"
          style={{ fontFamily: 'JetBrains Mono, monospace' }}>
          {rows.length - maxRows} more rows (truncated)
        </div>
      )}
    </div>
  );
}

// ─── Sample lesson component ───────────────────────────────────────
export default function SampleLesson() {
  const [stepIdx, setStepIdx] = useState(0);
  const [query, setQuery] = useState(STEPS[0].starter);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [checkPassed, setCheckPassed] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [runCount, setRunCount] = useState(0);

  const step = STEPS[stepIdx];

  const runQueryHandler = () => {
    setError(null);
    setShowHint(false);
    setRunCount(c => c + 1);
    try {
      const rows = runQuery(query, TABLES);
      setResult(rows);
      setCheckPassed(!!step.check(rows, query));
    } catch (e) {
      setError(e.message);
      setResult(null);
      setCheckPassed(false);
    }
  };

  const nextStep = () => {
    const next = stepIdx + 1;
    if (next < STEPS.length) {
      setStepIdx(next);
      setQuery(STEPS[next].starter);
      setResult(null);
      setError(null);
      setCheckPassed(false);
      setShowHint(false);
    }
  };

  const reset = () => {
    setQuery(step.starter);
    setResult(null);
    setError(null);
    setCheckPassed(false);
    setShowHint(false);
  };

  const isLastStep = stepIdx === STEPS.length - 1;

  return (
    <section id="sample-lesson" aria-labelledby="sample-heading"
      className="max-w-4xl mx-auto px-4 py-12 border-t border-zinc-900">
      <div className="text-[10px] uppercase tracking-[0.3em] text-emerald-300 mb-3"
        style={{ fontFamily: 'JetBrains Mono, monospace' }}>
        ◇ TRY IT NOW · SAMPLE LESSON
      </div>
      <h2 id="sample-heading"
        className="text-zinc-100 text-[28px] sm:text-[36px] font-bold leading-tight tracking-tight mb-3"
        style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
        Write real SQL. Right now. No signup.
      </h2>
      <p className="text-zinc-500 text-[14px] leading-relaxed max-w-2xl mb-6">
        Three steps. Ninety seconds. You'll write queries against a real employees table
        and see the results immediately — the same teaching pattern every atlas uses.
      </p>

      {/* Progress indicator */}
      <div className="flex items-center gap-2 mb-6" role="progressbar"
        aria-valuenow={stepIdx + 1} aria-valuemin={1} aria-valuemax={STEPS.length}
        aria-label={`Step ${stepIdx + 1} of ${STEPS.length}`}>
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center gap-2">
            <div className={`w-6 h-6 border flex items-center justify-center text-[11px] font-bold ${
              i < stepIdx
                ? 'border-emerald-400 bg-emerald-400 text-black'
                : i === stepIdx
                ? 'border-emerald-300 text-emerald-300'
                : 'border-zinc-800 text-zinc-600'
            }`}
              style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              {i < stepIdx ? <Check size={12} strokeWidth={3} aria-hidden="true" /> : i + 1}
            </div>
            {i < STEPS.length - 1 && (
              <div className={`w-8 h-px ${i < stepIdx ? 'bg-emerald-400' : 'bg-zinc-800'}`} aria-hidden="true" />
            )}
          </div>
        ))}
        <div className="ml-3 text-zinc-500 text-[11px] tracking-[0.2em] uppercase"
          style={{ fontFamily: 'JetBrains Mono, monospace' }}>
          Step {stepIdx + 1} of {STEPS.length} · {step.title}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left column: the table + prompt */}
        <div className="border border-zinc-800 bg-zinc-950/40 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Database size={14} className="text-emerald-300" aria-hidden="true" />
            <div className="text-emerald-300 text-[10px] tracking-[0.25em] uppercase font-semibold"
              style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              table: employees
            </div>
          </div>
          <DataTable rows={EMPLOYEES} maxRows={8} />

          {stepIdx === 0 && (
            <div className="mt-4 border border-emerald-400/30 bg-emerald-400/5 p-3">
              <div className="text-emerald-300 text-[10px] tracking-[0.25em] uppercase mb-1 font-semibold"
                style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                why this matters
              </div>
              <p className="text-zinc-200 text-[12.5px] leading-relaxed">
                SQL is the language every relational database speaks — Postgres, MySQL, SQLite, and the database
                behind most apps you use. It's one of the highest-leverage skills in software. What you're about
                to write below runs against a real database engine (SQLite) in your browser.
              </p>
            </div>
          )}

          <div className="mt-4">
            <div className="text-zinc-500 text-[10px] tracking-[0.25em] uppercase mb-1.5"
              style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              your task
            </div>
            <p className="text-zinc-200 text-[13.5px] leading-relaxed">
              {step.prompt}
            </p>
          </div>
        </div>

        {/* Right column: editor + output */}
        <div className="border border-zinc-800 bg-zinc-950/40 p-4 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <div className="text-emerald-300 text-[10px] tracking-[0.25em] uppercase font-semibold"
              style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              query
            </div>
            <button onClick={reset}
              className="text-zinc-500 hover:text-zinc-300 text-[10px] tracking-[0.2em] uppercase flex items-center gap-1 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-emerald-300"
              style={{ fontFamily: 'JetBrains Mono, monospace' }}
              aria-label="Reset query to starter">
              <RotateCcw size={10} aria-hidden="true" />
              reset
            </button>
          </div>

          <label htmlFor="sample-query" className="sr-only">SQL query</label>
          <textarea id="sample-query"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                e.preventDefault();
                runQueryHandler();
              }
            }}
            className="w-full bg-black border border-zinc-800 focus:border-emerald-300 focus:outline-none text-zinc-100 text-[13px] px-3 py-2 min-h-[100px] resize-y transition-colors"
            style={{ fontFamily: 'JetBrains Mono, monospace' }}
            spellCheck="false"
            autoCapitalize="off"
            autoCorrect="off"
            aria-describedby="sample-query-help" />
          <div id="sample-query-help" className="text-zinc-600 text-[10px] mt-1"
            style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            press Cmd/Ctrl+Enter to run
          </div>

          {/* Run button */}
          <div className="flex items-center gap-2 mt-3">
            <button onClick={runQueryHandler}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-300 text-black hover:bg-emerald-200 font-semibold text-[13px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              style={{ fontFamily: 'Manrope, sans-serif' }}>
              <Play size={13} strokeWidth={2.5} aria-hidden="true" />
              Run query
            </button>
            {runCount > 1 && !checkPassed && !showHint && (
              <button onClick={() => setShowHint(true)}
                className="text-zinc-400 hover:text-zinc-200 text-[12px] underline transition-colors"
                style={{ fontFamily: 'Manrope, sans-serif' }}>
                need a hint?
              </button>
            )}
          </div>

          {/* Hint */}
          {showHint && (
            <div className="mt-3 border border-amber-400/40 bg-amber-400/5 p-3">
              <div className="text-amber-300 text-[9.5px] tracking-[0.25em] uppercase mb-1"
                style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                hint
              </div>
              <div className="text-zinc-200 text-[12.5px]">{step.hint}</div>
              {step.solution && (
                <div className="mt-2 pt-2 border-t border-amber-400/20">
                  <div className="text-amber-300 text-[9.5px] tracking-[0.25em] uppercase mb-1"
                    style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                    solution
                  </div>
                  <code className="text-emerald-300 text-[12px] block whitespace-pre-wrap"
                    style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                    {step.solution}
                  </code>
                </div>
              )}
            </div>
          )}

          {/* Result / error */}
          {error && (
            <div className="mt-3 border border-rose-400/40 bg-rose-400/5 p-3 flex items-start gap-2">
              <AlertCircle size={13} className="text-rose-400 shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <div className="text-rose-300 text-[10px] tracking-[0.25em] uppercase mb-0.5"
                  style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  error
                </div>
                <div className="text-zinc-200 text-[12.5px]" role="alert">
                  {error}
                </div>
              </div>
            </div>
          )}

          {result && !error && (
            <div className="mt-3">
              <div className="flex items-center justify-between mb-1.5">
                <div className="text-emerald-300 text-[10px] tracking-[0.25em] uppercase font-semibold"
                  style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  result · {result.length} row{result.length !== 1 ? 's' : ''}
                </div>
                {checkPassed && (
                  <div className="flex items-center gap-1 text-emerald-300 text-[10.5px] tracking-[0.2em] uppercase font-semibold"
                    style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                    <Check size={11} strokeWidth={3} aria-hidden="true" />
                    passed
                  </div>
                )}
              </div>
              <DataTable rows={result} maxRows={10} />
            </div>
          )}

          {/* Success + next-step CTA */}
          {checkPassed && (
            <div className="mt-3 border border-emerald-400/40 bg-emerald-400/5 p-3">
              <div className="flex items-start gap-2 mb-2">
                <Sparkles size={13} className="text-emerald-300 shrink-0 mt-0.5" aria-hidden="true" />
                <div className="text-zinc-100 text-[13px] leading-relaxed">
                  {step.success}
                </div>
              </div>
              {!isLastStep ? (
                <button onClick={nextStep}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-emerald-300 text-emerald-300 hover:bg-emerald-300/10 font-semibold text-[12px] transition-colors"
                  style={{ fontFamily: 'Manrope, sans-serif' }}>
                  Next step
                  <ArrowRight size={12} strokeWidth={2.5} aria-hidden="true" />
                </button>
              ) : (
                <Link to="/atlas/db"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-300 text-black hover:bg-emerald-200 font-semibold text-[12px] transition-colors"
                  style={{ fontFamily: 'Manrope, sans-serif' }}>
                  Open the Databases atlas
                  <ArrowRight size={12} strokeWidth={2.5} aria-hidden="true" />
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer note */}
      <p className="text-zinc-600 text-[11px] mt-4"
        style={{ fontFamily: 'JetBrains Mono, monospace' }}>
        This preview uses an in-browser SQL subset. Real atlases run full SQLite (sql.js), CPython (Pyodide), and other real engines.
      </p>
    </section>
  );
}
