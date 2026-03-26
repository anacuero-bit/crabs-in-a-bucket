export default function AsciiCrab({ className = '' }: { className?: string }) {
  return (
    <pre className={`text-[var(--accent)] text-xs leading-none select-none ${className}`}>
      {`(\\/) (;,,;) (\\/)`}
    </pre>
  );
}
