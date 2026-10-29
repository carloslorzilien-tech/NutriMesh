// src/components/MetricCard.tsx — Tarjeta de métricas limpia (estilo producto Google)

interface MetricCardProps {
  value: string | number;
  label: string;
  note?: string;
  index?: string;
  tone?: 'default' | 'forest' | 'sand' | 'lime';
}

export default function MetricCard({ value, label, note, index, tone = 'default' }: MetricCardProps) {
  const isForest = tone === 'forest';

  return (
    <div
      className="card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        background: isForest ? 'var(--color-forest)' : 'var(--color-surface)',
        color: isForest ? '#F7F4EC' : 'var(--color-ink)',
        borderColor: isForest ? 'transparent' : 'var(--color-border)',
      }}
    >
      {index && (
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            color: isForest ? 'rgba(214, 242, 92, 0.8)' : 'var(--color-ink-muted)',
            fontWeight: 600,
          }}
        >
          {index}
        </span>
      )}

      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 28,
          fontWeight: 650,
          lineHeight: 1.1,
          color: isForest ? '#D6F25C' : 'var(--color-ink)',
          letterSpacing: '-0.02em',
        }}
      >
        {value}
      </div>

      <div
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: isForest ? '#E6E0D4' : 'var(--color-ink)',
        }}
      >
        {label}
      </div>

      {note && (
        <div
          style={{
            fontSize: 11,
            color: isForest ? 'rgba(247, 244, 236, 0.65)' : 'var(--color-ink-muted)',
            fontFamily: 'var(--font-mono)',
            marginTop: 2,
          }}
        >
          {note}
        </div>
      )}
    </div>
  );
}
