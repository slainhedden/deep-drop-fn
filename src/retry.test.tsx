import {act,cleanup,fireEvent,render,screen} from '@testing-library/react';
import {afterEach,beforeEach,describe,it,expect,vi} from 'vitest';
import App from './App';
import {dailySeed,generateGame} from './engine/questions';
import {entitiesById} from './data/entities';
beforeEach(()=>{vi.useFakeTimers();vi.setSystemTime(new Date('2026-11-10T12:00:00Z'));localStorage.clear();});
afterEach(()=>{cleanup();vi.useRealTimers();});
function start(){render(<App/>);fireEvent.click(screen.getByRole('button',{name:/play today/i}));fireEvent.click(screen.getByRole('button',{name:/start game/i}));}
function submit(text:string){fireEvent.change(screen.getByRole('textbox',{name:/your answer/i}),{target:{value:text}});fireEvent.submit(screen.getByRole('textbox',{name:/your answer/i}).closest('form')!);}
const canonical=()=>entitiesById.get(generateGame(dailySeed(),7)[0].validAnswerIds[0])!.name;
describe('retry within one fixed round deadline',()=>{
 it('keeps invalid attempts playable and accepts one canonical answer via Enter submit',()=>{
  start();submit('not a Fortnite answer');expect(screen.getByRole('status').textContent).toContain('Try another');
  expect(screen.queryByRole('button',{name:/next question/i})).toBeNull();
  expect(screen.getByRole('textbox')).not.toBeNull();
  submit(canonical());expect(screen.getByRole('button',{name:/next question/i})).not.toBeNull();
  expect(screen.queryByRole('textbox')).toBeNull();
 });
 it('does not extend time on typing or repeated invalid submissions and times out at zero',()=>{
  start();act(()=>vi.advanceTimersByTime(12000));submit('invalid attempt');
  expect(screen.getByText('00:08')).not.toBeNull();
  act(()=>vi.advanceTimersByTime(7000));submit('another invalid attempt');
  expect(screen.getByText('00:01')).not.toBeNull();
  act(()=>vi.advanceTimersByTime(1000));expect(screen.getByText('TIME’S UP')).not.toBeNull();
  expect(screen.getByText('NO POINTS')).not.toBeNull();
 });
 it('clears feedback and restores twenty seconds only when advancing to another round',()=>{
  start();submit('invalid');submit(canonical());fireEvent.click(screen.getByRole('button',{name:/next question/i}));
  expect(screen.getByText('00:20')).not.toBeNull();expect(screen.queryByRole('status')).toBeNull();expect((screen.getByRole('textbox') as HTMLInputElement).value).toBe('');
 });
});
