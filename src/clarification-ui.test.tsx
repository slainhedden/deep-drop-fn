import {act,cleanup,fireEvent,render,screen} from '@testing-library/react';
import {afterEach,beforeEach,describe,expect,it,vi} from 'vitest';
import App from './App';
vi.mock('./engine/questions',async importOriginal=>{const original=await importOriginal<typeof import('./engine/questions')>();return {...original,generateGame:()=>Array.from({length:7},()=>original.questionPool().find(q=>q.templateId==='location-chapter'&&q.parameters.chapter===1)!)};});
function start(){render(<App/>);fireEvent.click(screen.getByRole('button',{name:/play today/i}));fireEvent.click(screen.getByRole('button',{name:/start game/i}));return screen.getByRole('textbox',{name:'YOUR ANSWER'});}
function typo(input:HTMLElement){fireEvent.change(input,{target:{value:'Pleasent Park'}});fireEvent.submit(input.closest('form')!);}
beforeEach(()=>{localStorage.clear();vi.useFakeTimers();vi.setSystemTime(new Date('2026-11-13T01:00:00Z'));});
afterEach(()=>{cleanup();vi.useRealTimers();});
describe('inline clarification and an uninterrupted deadline',()=>{
 it('retries, dismisses and confirms once through canonical scoring',()=>{
  const input=start();typo(input);expect(screen.getByText('Did you mean Pleasant Park?')).toBeTruthy();
  fireEvent.keyDown(input,{key:'Escape'});expect(screen.queryByRole('group',{name:'Answer clarification'})).toBeNull();expect(screen.queryByRole('button',{name:'Pleasant Park'})).toBeNull();
  typo(input);const confirm=screen.getByRole('button',{name:'Confirm Pleasant Park'});fireEvent.click(confirm);fireEvent.click(confirm);
  expect(screen.queryByRole('group',{name:'Answer clarification'})).toBeNull();expect(screen.getByRole('button',{name:/next question/i})).toBeTruthy();
 });
 it('does not extend the timer for repeated invalid answers, reports or pending confirmation',()=>{
  const input=start();act(()=>vi.advanceTimersByTime(19000));typo(input);typo(input);
  fireEvent.click(screen.getByRole('button',{name:'Report missing answer'}));
  const report=JSON.parse((screen.getByRole('textbox',{name:'Missing answer report'}) as HTMLTextAreaElement).value);expect(report.attemptedAnswer).toBe('Pleasent Park');
  expect(screen.getByText(/Nothing is sent/)).toBeTruthy();
  act(()=>vi.advanceTimersByTime(1001));expect(screen.getByText('TIME’S UP')).toBeTruthy();expect(screen.queryByRole('button',{name:'Confirm Pleasant Park'})).toBeNull();
 });
});
