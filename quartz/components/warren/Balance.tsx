import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "../types"
import { classNames } from "../../util/lang"
import { readBalance, readBalanceLog, parseWhen, longDate, monthDay } from "./data"

// Two columns: what runs whether or not I show up, and what still needs my hands. The point of the
// page is the ratio, and the log underneath is that ratio moving. balance.json holds both columns;
// balance.jsonl holds one line per change.
export default (() => {
  const Balance: QuartzComponent = ({ displayClass }: QuartzComponentProps) => {
    const { automatic, by_hand } = readBalance()
    const moves = readBalanceLog()
    if (!automatic.length && !by_hand.length) return null
    return (
      <div class={classNames(displayClass, "balance")}>
        <p class="intro">
          Anything that can run on its own should, so what is left is the part only I can do: the clay,
          the ground, the words, the people. The point of this is the right column getting shorter.
        </p>
        <p class="tally mono">
          <span class="ok">{automatic.length} run without me</span>
          <span class="sep">·</span>
          <span>{by_hand.length} still need my hands</span>
        </p>

        <div class="columns">
          <section class="column">
            <h2>Runs without me</h2>
            <ul>
              {automatic.map((i) => (
                <li>
                  <span class="what">{i.what}</span>
                  <span class="when mono">
                    {i.when}
                    {i.since ? ` · since ${monthDay(parseWhen(i.since))}` : ""}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section class="column">
            <h2>Still my hands</h2>
            <ul>
              {by_hand.map((i) => (
                <li>
                  <span class="what">{i.what}</span>
                  <span class="when mono">{i.when}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {moves.length > 0 && (
          <section class="moves">
            <h2>How the line has moved</h2>
            <ul>
              {moves.map((m) => (
                <li>
                  <span class="date mono">{longDate(parseWhen(m.when))}</span>
                  <span class="what">{m.moved}</span>
                  {m.note ? <span class="note">{m.note}</span> : null}
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    )
  }

  Balance.css = `
.balance { padding-top: 34px; margin-top: 34px; border-top: 1px solid var(--dark); }
.balance .intro { font-size: 15px; line-height: 1.5; color: var(--darkgray); margin: 0; max-width: 60ch; }
.balance .tally { font-size: 13px; color: var(--darkgray); padding: 16px 0 18px; }
.balance .tally .ok { color: var(--ok); }
.balance .tally .sep { padding: 0 10px; color: var(--gray); }
.balance .columns { display: grid; grid-template-columns: 1fr 1fr; gap: 0 40px; }
.balance .column h2 { font-size: 13px; font-weight: 500; letter-spacing: 0.06em; text-transform: uppercase;
  color: var(--darkgray); margin: 0; padding-bottom: 6px; border-bottom: 1px solid var(--dark); }
.balance .column ul, .balance .moves ul { list-style: none; margin: 0; padding: 0; }
.balance .column li { display: flex; flex-direction: column; gap: 4px; padding: 16px 0; border-bottom: 1px solid var(--lightgray); }
.balance .what { font-size: 15px; line-height: 1.45; color: var(--dark); }
.balance .when { font-size: 12px; color: var(--darkgray); }
.balance .moves { padding-top: 34px; }
.balance .moves h2 { font-size: 13px; font-weight: 500; letter-spacing: 0.06em; text-transform: uppercase;
  color: var(--darkgray); margin: 0; padding-bottom: 6px; border-bottom: 1px solid var(--dark); }
.balance .moves li { display: flex; flex-direction: column; gap: 4px; padding: 16px 0; border-bottom: 1px solid var(--lightgray); }
.balance .moves .date { font-size: 12px; color: var(--darkgray); }
.balance .moves .note { font-size: 14px; line-height: 1.5; color: var(--darkgray); max-width: 60ch; }
@media all and (max-width: 750px) {
  .balance .columns { grid-template-columns: 1fr; gap: 28px; }
}
`
  return Balance
}) satisfies QuartzComponentConstructor
