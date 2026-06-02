import type { TaskStats } from '@/types';

interface StatsBarProps {
  stats: TaskStats;
}

interface StatPillProps {
  label: string;
  value: number;
  dotColor: string;
}

function StatPill({ label, value, dotColor }: StatPillProps) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg">
      <span className={`w-2 h-2 rounded-full shrink-0 ${dotColor}`} />
      <span className="text-sm font-semibold text-zinc-100 tabular-nums">{value}</span>
      <span className="text-xs text-zinc-500">{label}</span>
    </div>
  );
}

export default function StatsBar({ stats }: StatsBarProps) {
  const completion = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <StatPill label="Total"       value={stats.total}      dotColor="bg-amber-500" />
      <StatPill label="To Do"       value={stats.todo}       dotColor="bg-blue-500" />
      <StatPill label="In Progress" value={stats.inProgress} dotColor="bg-amber-500" />
      <StatPill label="Done"        value={stats.done}       dotColor="bg-emerald-500" />
      {stats.overdue > 0 && (
        <StatPill label="Overdue"   value={stats.overdue}    dotColor="bg-red-500" />
      )}

      {stats.total > 0 && (
        <div className="flex items-center gap-2.5 w-full sm:w-32 sm:ml-auto">
          <div className="w-full">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-zinc-600">Completion</span>
              <span className="text-zinc-400 font-medium tabular-nums">{completion}%</span>
            </div>
            <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-600 rounded-full transition-all duration-500"
                style={{ width: `${completion}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
