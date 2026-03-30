type HomeHeroProps = {
  userName: string;
  greeting?: string;
  tagline: string;
};

export function HomeHero({ userName, greeting = '上午好', tagline }: HomeHeroProps) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
          {greeting}，{userName}
        </h1>
        <p className="mt-1 text-sm text-slate-600">{tagline}</p>
      </div>
      <div className="text-xs font-medium tracking-wide text-slate-500 shrink-0">
        经营搭档 · 今日
      </div>
    </div>
  );
}
