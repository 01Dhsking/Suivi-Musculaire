import { Flame } from 'lucide-react';

export default function FocusBanner() {
  return <section className="focus-banner" aria-label="Mode focus">
    <div className="focus-copy">
      <span className="focus-status"><Flame size={18}/> MODE FOCUS</span>
      <h2 className="focus-title">CONSTRUIS<br/><span>TA FORCE.</span></h2>
      <p>Chaque effort compte. Rends tes progrès visibles.</p>
    </div>
    <svg className="focus-athlete" viewBox="0 0 310 270" fill="none" aria-hidden="true">
      <path d="M6 220 130 4M175 266 303 41" stroke="currentColor" strokeWidth="2" opacity=".18"/>
      <path d="m74 113 28-17 24 15 29 5 28-5 25-15 28 17-13 52-25 29-10 58h-66l-10-58-25-29-13-52Z" fill="#ff7c24" fillOpacity=".15" stroke="currentColor" strokeWidth="4" strokeLinejoin="round"/>
      <path d="M132 83c-9-12-9-29 0-40 12-14 36-14 48 0 9 11 9 28 0 40l-12 13h-24l-12-13Z" fill="#ff7c24" fillOpacity=".2" stroke="currentColor" strokeWidth="4"/>
      <path d="m99 98-25-15-15-40-20 10 6 63 31 29m135-47 25-15 15-40 20 10-6 63-31 29" fill="#ff7c24" fillOpacity=".2" stroke="currentColor" strokeWidth="5" strokeLinejoin="round"/>
      <path d="m114 123 17 29 24 10 24-10 17-29M155 163v76m-32-57 21 8m43-8-21 8m-39 16 17 6m39-6-17 6" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
      <path d="m20 40 49-14m173 0 49 14" stroke="currentColor" strokeWidth="7" strokeLinecap="round"/>
      <path d="m27 24 8 30m18-38 9 31m187-31-9 31m35-23-8 30" stroke="currentColor" strokeWidth="13" strokeLinecap="round"/>
      <path d="m119 252-8 17m80-17 8 17" stroke="currentColor" strokeWidth="5"/>
    </svg>
  </section>;
}
