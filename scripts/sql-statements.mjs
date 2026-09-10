// Split this repository's SQL files while preserving PL/pgSQL dollar-quoted bodies.
export function statements(source) {
 const result=[]; let start=0, quote=false, dollar=false, comment=false;
 for(let i=0;i<source.length;i++) {
  if(comment){if(source[i]==='\n')comment=false;continue;}
  if(!quote&&source.slice(i,i+2)==='$$'){dollar=!dollar;i++;continue;}
  if(dollar)continue;
  if(!quote&&source.slice(i,i+2)==='--'){comment=true;i++;continue;}
  if(source[i]==="'"){if(quote&&source[i+1]==="'"){i++;continue;}quote=!quote;continue;}
  if(!quote&&source[i]===';'){result.push(source.slice(start,i));start=i+1;}
 }
 if(source.slice(start).trim())result.push(source.slice(start));
 return result.filter(s=>s.replace(/--[^\n]*/g,'').trim());
}
