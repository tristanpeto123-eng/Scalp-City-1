import {STRATEGIES,DEFAULT_COSTS,parseDailyCSV,demoData} from './cfd-engine.js';
import {BacktesterAgent,BT01} from './backtester-agent.js';

// Independent research agent station; does not modify app.js, scene3d.js or training-worker.js.
const $=s=>document.querySelector(s),agent=new BacktesterAgent();
let dataset=demoData(),report=null,selected=null,configUsed=null;
const launch=document.createElement('button');launch.id='bt01Launch';launch.className='cfd-launch cfd-agent-launch';
launch.type='button';launch.innerHTML='<span class="cfd-agent-dot" aria-hidden="true"></span>BT-01 · BACKTESTER';
launch.setAttribute('aria-label','Open separate Backtester Agent BT-01');$('.hud')?.appendChild(launch);
const dialog=document.createElement('dialog');dialog.id='bt01Dialog';dialog.className='modal cfd-modal';
dialog.innerHTML=`
<div class="terminal cfd-terminal" role="document" aria-label="BT-01 Independent Backtester Agent">
  <div class="modal-head"><div><small>SCALP CITY · AGENTS / BT-01</small><h2>BACKTESTER AGENT</h2></div><button type="button" id="bt01Close" aria-label="Close BT-01">✕</button></div>
  <div class="cfd-agent-info"><span class="cfd-agent-icon">BT</span><div><strong>BT-01 · QUANTITATIVE VALIDATION</strong><p>Independent worker · On-demand testing · Isolated from all execution agents</p></div><span class="cfd-agent-state" id="bt01State">IDLE</span></div>
  <div class="cfd-agent-flow" aria-label="Agent connections"><span>RESEARCHER</span><b>→</b><span>BT-01 BACKTESTER</span><b>→</b><span>VALIDATOR / RISK</span></div>
  <p class="cfd-warning">RESEARCH ONLY · BT-01 cannot place trades. Historical findings are unverified until real data, point-in-time membership, and broker tariffs are supplied.</p>
  <div class="cfd-status synthetic" id="cfdDataStatus"></div>
  <div class="cfd-actions"><button id="cfdDemo" type="button">RESET SYNTHETIC DATA</button><label class="cfd-upload">IMPORT DAILY CSV<input id="cfdCsv" type="file" accept=".csv,text/csv" /></label></div>
  <p class="cfd-tip">One row per security per session. Required CSV: <code>date,security_id,sector,open,high,low,close,volume</code>. Optional: <code>split_adjusted_close,cash_dividend,spread_bps,borrow_available</code>.</p>
  <label class="field">BACKTEST ASSIGNMENT<select id="cfdPick"><option value="ALL">ALL SIX STRATEGIES</option></select></label>
  <div class="cfd-grid">
    <label class="field">STARTING CAPITAL<input id="cfdCapital" type="number" min="100" step="100" value="10000" /></label>
    <label class="field">GROSS EXPOSURE<input id="cfdGross" type="number" min="0.1" max="2" step="0.1" value="1" /></label>
    <label class="field">FULL SPREAD (bps)<input id="cfdSpread" type="number" min="0" step="0.5" value="6" /></label>
    <label class="field">COMMISSION / SIDE (bps)<input id="cfdCommission" type="number" min="0" step="0.5" value="2" /></label>
    <label class="field">SLIPPAGE / SIDE (bps)<input id="cfdSlippage" type="number" min="0" step="0.5" value="2" /></label>
    <label class="field">LONG FINANCING APR (%)<input id="cfdFunding" type="number" min="0" step="0.25" value="7" /></label>
    <label class="field">SHORT FINANCING APR (%)<input id="cfdShort" type="number" min="-20" step="0.25" value="3" /></label>
    <label class="field">SHORT BORROW APR (%)<input id="cfdBorrow" type="number" min="0" step="0.25" value="1" /></label>
  </div>
  <p class="cfd-tip">Defaults are example scenarios, NOT confirmed CFD broker tariffs. Signals generated at close enter at next-session open.</p>
  <div class="cfd-actions"><button id="cfdRun" type="button" class="cfd-primary">ASSIGN BACKTEST</button><button id="cfdStress" type="button">BACKTEST + 2× COST STRESS</button><button id="cfdCancel" type="button" disabled>CANCEL JOB</button></div>
  <div id="cfdStatus" class="cfd-status" role="status">BT-01 READY · AWAITING TASK</div>
  <div class="cfd-table-wrap"><table class="cfd-table"><thead><tr><th>STRATEGY</th><th>NET %</th><th>FINAL 30% %</th><th>2× COST %</th><th>SHARPE</th><th>MAX DD</th><th>ORDERS</th></tr></thead><tbody id="cfdRows"></tbody></table></div>
  <div class="cfd-detail" id="cfdDetail">No report yet. Assign a backtest above.</div>
  <canvas id="cfdEquity" width="780" height="220" aria-label="BT-01 equity curve"></canvas>
  <div class="cfd-actions"><button id="cfdExport" type="button" disabled>EXPORT COMPLETE AGENT REPORT</button><button id="cfdEquityCsv" type="button" disabled>EXPORT EQUITY CSV</button></div>
  <div class="cfd-history"><strong>BT-01 TASK HISTORY (LOCAL)</strong><div id="bt01History">No saved tasks</div></div>
  <p class="cfd-tip cfd-footnote">The final-30% figure is chronological but not independently selected out-of-sample validation. No live trades, point-in-time universe verification, delisting/split quantity adjustment, FX, tax, or intraday margin calls. All findings must be reviewed by Validator and Risk Manager before any deployment decision.</p>
</div>`;
document.body.appendChild(dialog);
STRATEGIES.forEach(s=>{const o=document.createElement('option');o.value=s.id;o.textContent=s.id+' · '+s.name;$('#cfdPick').appendChild(o)});
const format=(v,n=1)=>Number.isFinite(v)?v.toFixed(n):'—';
function status(txt,bad=false){const el=$('#cfdStatus');el.textContent=txt;el.classList.toggle('bad',bad)}
function dataLabel(){const first=dataset.dates[0],last=dataset.dates.at(-1),el=$('#cfdDataStatus');el.textContent=`${dataset.source} · ${dataset.symbols.length} ASSETS · ${dataset.dates.length} SESSIONS · ${first} → ${last}`;el.classList.toggle('synthetic',dataset.source==='SYNTHETIC')}
function resetResult(){report=null;selected=null;$('#cfdRows').replaceChildren();$('#cfdExport').disabled=true;$('#cfdEquityCsv').disabled=true;$('#cfdDetail').textContent='No report yet';const cv=$('#cfdEquity');cv.getContext('2d').clearRect(0,0,cv.width,cv.height)}
function costs(){const num=(id,min,max)=>{const x=Number($('#'+id).value);if(!Number.isFinite(x)||x<min||x>max)throw Error('Check '+id);return x};return {...DEFAULT_COSTS,capital:num('cfdCapital',100,1e8),grossExposure:num('cfdGross',.1,2),spreadBps:num('cfdSpread',0,500),commissionBps:num('cfdCommission',0,100),slippageBps:num('cfdSlippage',0,500),longApr:num('cfdFunding',0,100)/100,shortApr:num('cfdShort',-20,100)/100,borrowApr:num('cfdBorrow',0,100)/100}}
function setBusy(busy){$('#cfdRun').disabled=busy;$('#cfdStress').disabled=busy;$('#cfdCancel').disabled=!busy;$('#cfdDemo').disabled=busy;$('#cfdPick').disabled=busy;$('#cfdCsv').disabled=busy}
function showHistory(){const host=$('#bt01History');host.replaceChildren();for(const r of agent.history.slice(0,8)){const line=document.createElement('div');line.className='cfd-history-row';line.textContent=`${r.jobId} · ${r.source} · ${r.count} strategies · ${new Date(r.date).toLocaleString()}`;host.appendChild(line)}if(!agent.history.length)host.textContent='No saved tasks'}
function chart(rows){const cv=$('#cfdEquity'),c=cv.getContext('2d'),W=cv.width,H=cv.height,pad=25;c.clearRect(0,0,W,H);c.fillStyle='#080b1a';c.fillRect(0,0,W,H);if(!rows?.length)return;
  const values=rows.map(x=>x.nav),low=Math.min(...values),high=Math.max(...values),range=high-low||1;
  c.strokeStyle='#28263b';c.lineWidth=1;for(let i=0;i<=4;i++){const y=pad+(H-2*pad)*i/4;c.beginPath();c.moveTo(pad,y);c.lineTo(W-pad,y);c.stroke()}
  const x=i=>pad+i*(W-2*pad)/Math.max(1,rows.length-1),y=v=>H-pad-(v-low)/range*(H-2*pad);
  const cut=Math.floor(rows.length*.7);c.setLineDash([4,5]);c.strokeStyle='#ffd35a';c.beginPath();c.moveTo(x(cut),pad);c.lineTo(x(cut),H-pad);c.stroke();c.setLineDash([]);
  c.strokeStyle='#2efac6';c.lineWidth=2.4;c.beginPath();rows.forEach((r,i)=>i?c.lineTo(x(i),y(r.nav)):c.moveTo(x(i),y(r.nav)));c.stroke();c.fillStyle='#bcb3da';c.font='12px monospace';c.fillText(format(high,0),pad+4,16);c.fillText(format(low,0),pad+4,H-8);
}
function focus(row){selected=row;const c=row.costs,m=row.metrics;
  $('#cfdDetail').textContent=`${row.id} · Net P&L ${format(row.netPnL,2)} · Price P&L ${format(row.grossPricePnL,2)} · Spread ${format(c.spread,2)} · Slippage ${format(c.slippage,2)} · Commissions ${format(c.commission,2)} · Funding ${format(c.financing,2)} · Borrow ${format(c.borrow,2)} · Dividend adjustments ${format(c.dividends,2)} · Margin exits ${m.marginEvents}`;
  document.querySelectorAll('#cfdRows tr').forEach(tr=>tr.classList.toggle('active',tr.dataset.id===row.id));chart(row.curve)
}
function drawReport(){const host=$('#cfdRows');host.replaceChildren();if(!report)return;
  const byId=new Map(report.robustness.map(x=>[x.id,x]));
  for(const r of report.results){const m=r.metrics,stress=byId.get(r.id),tr=document.createElement('tr');tr.dataset.id=r.id;
    const values=[r.id+' '+r.name,format(m.netReturnPct)+'%',format(m.holdoutReturnPct)+'%',Number.isFinite(stress?.stressedNetReturnPct)?format(stress.stressedNetReturnPct)+'%':'—',format(m.sharpe,2),format(m.maxDrawdownPct)+'%',String(m.orders)];
    values.forEach((v,i)=>{const td=document.createElement('td');td.textContent=v;if([1,2,3].includes(i)&&v!=='—')td.className=parseFloat(v)<0?'negative':'positive';tr.appendChild(td)});
    tr.tabIndex=0;tr.setAttribute('role','button');tr.addEventListener('click',()=>focus(r));tr.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();focus(r)}});host.appendChild(tr)
  }
  if(report.results.length)focus(report.results[0]);$('#cfdExport').disabled=false;$('#cfdEquityCsv').disabled=false;showHistory();
}
function saveFile(name,content,mime){const url=URL.createObjectURL(new Blob([content],{type:mime})),a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500)}
function assign(stress=false){try{const config=costs();const pick=$('#cfdPick').value;const jobId=agent.run({dataset,config,strategyIds:[pick],stress});resetResult();configUsed=config;status(jobId+' · QUEUED · '+(stress?'BASE + COST STRESS':'BASELINE'));setBusy(true)}catch(err){status('TASK REJECTED · '+err.message,true)}}
agent.subscribe(event=>{
  const badge=$('#bt01State');badge.textContent=event.state;launch.classList.toggle('cfd-agent-busy',agent.busy);
  if(event.type==='queued')setBusy(true);
  if(event.type==='started')status(`BT-01 EXECUTING · ${event.total} TESTS IN QUEUE`);
  if(event.type==='progress')status(`BT-01 WORKING · ${event.completed}/${event.total} · ${event.strategyId} · ${event.scenario}`);
  if(event.type==='completed'){report=event.report;drawReport();status(`BT-01 COMPLETE · ${report.results.length} STRATEGIES · ${report.dataset.source} · RESEARCH ONLY`);setBusy(false)}
  if(event.type==='failed'||event.type==='rejected'){status('BT-01 FAILED · '+event.error,true);setBusy(false)}
  if(event.type==='cancelled'){status('BT-01 CANCELLED');setBusy(false)}
});
launch.addEventListener('click',()=>dialog.showModal());$('#bt01Close').addEventListener('click',()=>dialog.close());
$('#cfdRun').addEventListener('click',()=>assign(false));$('#cfdStress').addEventListener('click',()=>assign(true));
$('#cfdCancel').addEventListener('click',()=>agent.stop());
$('#cfdDemo').addEventListener('click',()=>{if(agent.busy)return;dataset=demoData();dataLabel();resetResult();status('SYNTHETIC DEMO READY')});
$('#cfdCsv').addEventListener('change',async e=>{if(agent.busy)return;const f=e.target.files?.[0];if(!f)return;try{dataset=parseDailyCSV(await f.text());dataLabel();resetResult();status(`IMPORTED ${dataset.symbols.length} ASSETS · VERIFY DATA & CFD TERMS`)}catch(err){status('IMPORT FAILED · '+err.message,true)}e.target.value=''});
$('#cfdExport').addEventListener('click',()=>{if(!report)return;saveFile(report.jobId+'-report.json',JSON.stringify(report,null,2),'application/json')});
$('#cfdEquityCsv').addEventListener('click',()=>{if(!selected)return;saveFile((report?.jobId||BT01.id)+'-'+selected.id+'-equity.csv','date,nav,margin,orders\n'+selected.curve.map(x=>[x.date,x.nav,x.margin,x.orders].join(',')).join('\n'),'text/csv')});
dataLabel();showHistory();
