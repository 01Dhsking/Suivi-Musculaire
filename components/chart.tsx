'use client';
import { Area, AreaChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
export default function ProgressChart({ data, unit, target, detailed }: { data: { time: number; value: number }[]; unit: string; target: number | null; detailed: boolean }) {
  const label = (time: number) => new Date(time).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', ...(detailed ? { hour: '2-digit', minute: '2-digit' } : {}) });
  return <div className="chart-canvas" role="img" aria-label={`Évolution : ${data.length} points, de ${data[0]?.value} à ${data.at(-1)?.value} ${unit}.`}>
    <ResponsiveContainer width="100%" height="100%" minWidth={0}>
      <AreaChart data={data} margin={{ top: 20, right: 16, left: 0, bottom: 5 }}>
        <defs><linearGradient id="orange-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#ff7c24" stopOpacity={0.35}/><stop offset="100%" stopColor="#ff7c24" stopOpacity={0}/></linearGradient></defs>
        <CartesianGrid stroke="#3a3f47" vertical={false} strokeDasharray="3 5" />
        <XAxis dataKey="time" type="number" domain={['dataMin','dataMax']} scale="time" tickFormatter={label} minTickGap={50} tickLine={false} axisLine={false} tick={{ fill: '#b5bac3', fontSize: 14 }} dy={10}/>
        <YAxis domain={['auto','auto']} width={54} tickLine={false} axisLine={false} tick={{ fill: '#b5bac3', fontSize: 14 }} tickFormatter={v => Number(v).toLocaleString('fr-FR', { maximumFractionDigits: 1 })}/>
        <Tooltip labelFormatter={v => label(Number(v))} formatter={v => [`${Number(v).toLocaleString('fr-FR')} ${unit}`, 'Mesure']} contentStyle={{ background: '#191d23', color: '#f5f5f4', fontSize: 16, border: '1px solid #a35c2c', borderRadius: 10 }} itemStyle={{ color: '#ffad74' }} labelStyle={{ color: '#f5f5f4' }} cursor={{ stroke: '#ffad74' }}/>
        {target !== null && <ReferenceLine y={target} stroke="#ffc36e" strokeDasharray="5 5" label={{ value: `Objectif ${target} ${unit}`, position: 'insideTopRight', fill: '#ffc36e', fontSize: 14 }} ifOverflow="extendDomain"/>}
        <Area type="linear" dataKey="value" stroke="#ff7c24" strokeWidth={3} fill="url(#orange-fill)" dot={{ r: 3, strokeWidth: 2, fill: '#191d23' }} activeDot={{ r: 6 }}/>
      </AreaChart>
    </ResponsiveContainer>
  </div>;
}
