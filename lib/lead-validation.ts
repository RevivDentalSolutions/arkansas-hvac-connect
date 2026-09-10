import { priceKeyForLead } from './partner-routing';
export type LeadPayload = Record<string, unknown> & {name:string;phone:string;flow:string;service:string;email?:string;city?:string;zip?:string;consent:boolean;authority?:string;urgency?:string;timeline?:string;running?:string;isTest?:boolean};
const repair = new Set(['AC not cooling','AC blowing warm air','System not turning on','System freezing','Unusual noise','Heating not working','Poor airflow','Thermostat issue','Unsure']);
const replacement = new Set(['Replace AC','Replace heating','Replace full HVAC','Replace heat pump','Unsure']);
export function validateLead(input:unknown):LeadPayload {
 if(!input||typeof input!=='object'||Array.isArray(input))throw Error('Invalid request');
 const raw=input as Record<string,unknown>, p:Record<string,unknown>={};
 for(const [k,v] of Object.entries(raw))if(typeof v==='string')p[k]=v.trim().slice(0,k==='description'?2000:500);
 const digits=String(p.phone||'').replace(/\D/g,'');
 if(!p.name||!/^\d{10}$|^1\d{10}$/.test(digits))throw Error('Name and valid phone required');
 p.phone=digits.length===10?`+1${digits}`:`+${digits}`;
 if(p.flow!=='repair'&&p.flow!=='replacement')throw Error('Invalid lead type');
 if(!(p.flow==='repair'?repair:replacement).has(String(p.service)))throw Error('Invalid service');
 if(p.zip&&!/^\d{5}(?:-\d{4})?$/.test(String(p.zip)))throw Error('Invalid ZIP');
 if(!p.zip&&!p.city)throw Error('City or ZIP required');
 if(p.email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(p.email)))throw Error('Invalid email');
 if(raw.consent!==true)throw Error('Consent required');
 p.consent=true;
 // Public input can only opt OUT of production routing, never opt into billing.
 p.isTest=raw.isTest===true||/^test(?:\b|ing)/i.test(String(p.name));
 return p as LeadPayload;
}
export function classifyLead(p:LeadPayload){
 let score=20+(p.zip?15:0)+(p.authority==='Homeowner'?35:0);
 if(p.flow==='replacement'&&['0–7 days','This month'].includes(p.timeline||''))score+=30;
 if(p.flow==='repair'&&(['No','Partly / not sure'].includes(p.running||'')||p.urgency==='Today'))score+=30;
 const label=score>=80?(p.flow==='replacement'?'HOT REPLACEMENT':'HOT REPAIR'):score>=50?'WARM':'LOW / REVIEW';
 const service=p.service==='Unsure'?null:p.flow==='replacement'?'System replacement':p.service==='Heating not working'?'Heating repair':'AC repair';
 return {score,label,service,priceKey:priceKeyForLead({flow:p.flow,service:p.service,scoreLabel:label,urgency:p.urgency}),
 qualification:p.isTest?'test':(['Homeowner','Landlord'].includes(p.authority||'')&&service?'qualified':'review')};
}
