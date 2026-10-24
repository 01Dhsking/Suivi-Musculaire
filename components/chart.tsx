'use client';
import { Area, AreaChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
export default function ProgressChart({ data, unit, target, detailed }: { data: { time: number; value: number }[]; unit: string; target: number | null; detailed: boolean }) {
  const label = (time: number) => new Date(time).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', ...(detailed ? { hour: '2-digit', minute: '2-digit' } : {}) });
  return <div className="chart-canvas" role="img" aria-label={`Évolution : ${data.length} points, de ${data[0]?.value} à ${data.at(-1)?.value} ${unit}.`}>
    <ResponsiveContainer width="100%" height="100%" minWidth={0}>
      <AreaChart data={data} margin={{ top: 20, right: 16, left: 0, bottom: 5 }}>
        <defs><linearGradient id="green-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#6b8b4e" stopOpacity={0.25}/><stop offset="100%" stopColor="#6b8b4e" stopOpacity={0}/></linearGradient></defs>
        <CartesianGrid stroke="#e8ebe3" vertical={false} strokeDasharray="3 5" />
        <XAxis dataKey="time" type="number" domain={['dataMin','dataMax']} scale="time" tickFormatter={label} minTickGap={50} tickLine={false} axisLine={false} tick={{ fill: '#7b8276', fontSize: 11 }} dy={10}/>
        <YAxis domain={['auto','auto']} width={48} tickLine={false} axisLine={false} tick={{ fill: '#7b8276', fontSize: 11 }} tickFormatter={v => Number(v).toLocaleString('fr-FR', { maximumFractionDigits: 1 })}/>
        <Tooltip labelFormatter={v => label(Number(v))} formatter={v => [`${Number(v).toLocaleString('fr-FR')} ${unit}`, 'Mesure']} contentStyle={{ border: '1px solid #dce2d3', borderRadius: 12 }}/>
        {target !== null && <ReferenceLine y={target} stroke="#b08842" strokeDasharray="5 5" label={{ value: `Objectif ${target} ${unit}`, position: 'insideTopRight', fill: '#a17936', fontSize: 11 }} ifOverflow="extendDomain"/>}
        <Area type="linear" dataKey="value" stroke="#5d7d41" strokeWidth={2.5} fill="url(#green-fill)" dot={{ r: 3, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6 }}/>
      </AreaChart>
    </ResponsiveContainer>
  </div>;
}
