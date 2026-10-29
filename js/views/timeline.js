import {readingPresets,routineGroups} from '../data/narrative.js?v=0.32.0';
import {eventLabel} from '../data/language.js?v=0.32.0';
import {timelineSelection,timelineGroups} from '../data/timeline.js?v=0.32.0';
const el=(tag,text)=>{const node=document.createElement(tag);if(text!==undefined)node.textContent=text;return node;};
export function timelineFilters(params,onApply,idPrefix='event'){
 const initial=timelineSelection(params),form=el('form');form.className='timeline-filters';
 const type=el('select'),from=el('input'),to=el('input'),preset=el('select');type.add(new Option('All Types',''));from.type=to.type='number';from.step=to.step='1';
 for(const [node,label,id] of [[preset,'Reading preset',`${idPrefix}-preset`],[type,'Event type',`${idPrefix}-type`],[from,'From year',`${idPrefix}-from`],[to,'To year',`${idPrefix}-to`]]){const group=el('div'),caption=el('label',label);node.id=id;caption.htmlFor=id;group.append(caption,node);form.append(group);}
 for(const [value,label] of Object.entries(readingPresets))preset.add(new Option(label,value));preset.value=initial.preset;from.value=initial.from;to.value=initial.to;
 const details=el('details'),summary=el('summary','Hide routine events'),boxes=new Map();details.className='timeline-noise';details.open=initial.exclude.length>0;
 details.append(summary);for(const [key,group] of Object.entries(routineGroups)){const label=el('label'),box=el('input');box.type='checkbox';box.checked=initial.exclude.includes(key);boxes.set(key,box);label.append(box,document.createTextNode(group.label));details.append(label);}form.append(details);
 const help=el('p','Major Events hides routine occupation, movement and affiliation changes; unknown types remain visible. Warfare includes deaths, wounds and abductions, which may occur outside wars. Personal History includes recorded life, relationship and creative events. Year bounds exclude undated events.');help.className='muted timeline-help';form.append(help);
 const apply=el('button','Apply filters'),reset=el('button','Show all events');apply.type='submit';reset.type='button';apply.className=reset.className='quiet';form.append(apply,reset);
 let selectedType=initial.type;
 const selection=()=>({type:selectedType,from:from.value,to:to.value,preset:preset.value,exclude:[...boxes].filter(([,box])=>box.checked).map(([key])=>key)});
 type.onchange=()=>{selectedType=type.value;};
 const submit=()=>{if(!form.reportValidity())return;if(from.value!==''&&to.value!==''&&Number(from.value)>Number(to.value)){to.setCustomValidity('To year must be no earlier than From year.');to.reportValidity();return;}onApply(selection());};
 from.oninput=to.oninput=()=>to.setCustomValidity('');form.onsubmit=event=>{event.preventDefault();submit();};
 const resetFilters=(notify=true)=>{selectedType='';type.value='';from.value=to.value='';to.setCustomValidity('');preset.value='all';for(const box of boxes.values())box.checked=false;if(notify)submit();};reset.onclick=()=>resetFilters();
 return {form,selection,reset:resetFilters,setTypes(types){type.replaceChildren(new Option('All Types',''));for(const name of types)type.add(new Option(eventLabel(name),name));if(selectedType&&!types.includes(selectedType))type.add(new Option(eventLabel(selectedType),selectedType));type.value=selectedType;}};
}
// Real nested lists keep year headings out of the event-item list semantics.
export function renderTimeline(container,rows,makeRow){
 container.replaceChildren();for(const group of timelineGroups(rows)){const li=el('li'),heading=el('h3',group.label),list=el('ul');li.className='timeline-year';list.className='record-results';heading.className='timeline-year-heading';list.append(...group.rows.map(makeRow));li.append(heading,list);container.append(li);}
}
export function timelineCount(total,unfiltered,offset){return (total?`Events ${offset+1}–${Math.min(offset+50,total)} of ${total.toLocaleString()}`:'No matching events.')+` · ${(unfiltered-total).toLocaleString()} hidden by filters (${unfiltered.toLocaleString()} recorded events).`;}
