/**
 * Marc's line, set in full from the first moment (8 Nov: the words no longer
 * dim and light up one by one), with the credit beneath.
 */
export function QuoteWords({
  before,
  emphasis,
  after,
  children,
}: {
  before: string;
  emphasis: string;
  after: string;
  /** The credit, beneath the words. */
  children: React.ReactNode;
}) {
  return (
    <div className="qw lit">
      <blockquote>
        {before}
        <em>{emphasis}</em>
        {after}
      </blockquote>
      {children}
    </div>
  );
}
