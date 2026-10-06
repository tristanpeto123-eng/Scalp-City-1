let running=false, workerId=0, symbol="SPY", data=[], rng=Math.random, generation=0, champion=null;
function mulberry32(a){return function(){let t=a+=0x6D2B79F5;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}}
function ema(vals,p){const k=2/(p+1),o=[];let e=vals[0];for(const v of vals){e=v*k+e*(1-k);o.push(e)}return o}
function params(){
  const base=champion?.params||{fast:9,slow:21,vwapBand:.0018,stopAtr:1.3,takeR:2.0,minVolume:1.0};
  const mut=(v,pct,min,max)=>Math.max(min,Math.min(max,v*(1+(rng()-.5)*pct)));
  return {fast:Math.round(mut(base.fast,.7,4,18)),slow:Math.round(mut(base.slow,.5,15,50)),vwapBand:mut(base.vwapBand,1.3,.0003,.006),stopAtr:mut(base.stopAtr,1.0,.5,3.0),takeR:mut(base.takeR,1.2,.8,5),minVolume:mut(base.minVolume,.9,.6,2.0)}
}
function backtest(p){
  const vals=data.map(x=>x.close), ef=ema(vals,p.fast), es=ema(vals,p.slow);let pv=0,vv=0,volAvg=data[0].volume,atr=data[0].high-data[0].low;
  let pnl=0,peak=0,dd=0,trades=0,wins=0,grossWin=0,grossLoss=0,hold=0;
  for(let i=30;i<data.length-2;i++){const d=data[i];pv+=((d.high+d.low+d.close)/3)*d.volume;vv+=d.volume;const vwap=pv/vv;volAvg=volAvg*.97+d.volume*.03;atr=atr*.93+(d.high-d.low)*.07;
    const trend=ef[i]>es[i]&&ef[i-1]<=es[i-1], near=Math.abs(d.close-vwap)/d.close<p.vwapBand, liquid=d.volume>volAvg*p.minVolume;
    if(trend&&near&&liquid){trades++;const entry=d.close, stop=entry-atr*p.stopAtr, target=entry+(entry-stop)*p.takeR;let exit=entry, win=false;
      for(let j=i+1;j<Math.min(data.length,i+35);j++){if(data[j].low<=stop){exit=stop;hold+=j-i;break}if(data[j].high>=target){exit=target;win=true;hold+=j-i;break}exit=data[j].close}
      const r=(exit-entry)/(entry-stop||1);const dollars=r*100;pnl+=dollars;if(dollars>0){wins++;grossWin+=dollars}else grossLoss+=Math.abs(dollars);peak=Math.max(peak,pnl);dd=Math.max(dd,peak-pnl);i+=2;
    }
  }
  const pf=grossLoss?grossWin/grossLoss:grossWin?3:0,wr=trades?wins/trades:0,expect=trades?pnl/trades/100:0,ddPct=Math.min(99,dd/Math.max(1000,peak+2500)*100);
  const robust=trades>=18&&trades<=420,score=(pf*22)+(wr*24)+(expect*18)-ddPct*1.7+(robust?10:-12)-Math.abs(trades-120)*.015;
  return {pnl,trades,wins,profitFactor:pf,winRate:wr*100,maxDrawdown:ddPct,expectancyR:expect,score,avgHold:trades?hold/trades:0}
}
function run(){
  if(!running)return;for(let k=0;k<3;k++){generation++;const p=params(),m=backtest(p),id=`${workerId}-${generation}-${Math.floor(rng()*9999)}`;const result={id,symbol,generation,params:p,...m,note:m.score>58?"survivor retained":"candidate rejected"};if(!champion||result.score>champion.score)champion=result;postMessage({type:"result",result})}
  setTimeout(run,0)
}
onmessage=e=>{if(e.data.type==="start"){running=true;workerId=e.data.workerId;symbol=e.data.symbol;data=e.data.data;rng=mulberry32(e.data.seed||Date.now());champion=e.data.parent||null;run()}if(e.data.type==="stop")running=false};
