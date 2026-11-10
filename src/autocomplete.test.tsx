import {createRef} from 'react';
import {render,screen,fireEvent,cleanup} from '@testing-library/react';
import {afterEach,describe,it,expect,vi} from 'vitest';
import {GameScreen} from './App';
import {questionPool} from './engine/questions';
import {validateAnswer} from './engine/validation';
const rifles=questionPool().find(question=>question.templateId==='weapon-class'&&question.parameters.weaponClass==='assault rifle')!;
const shotguns=questionPool().find(question=>question.templateId==='weapon-class'&&question.parameters.weaponClass==='shotgun')!;
afterEach(cleanup);
describe('autocomplete in the playable form',()=>{
 it('refreshes suggestions between consecutive questions with the same answer type',()=>{
  const props={round:0,total:7,seconds:20,score:0,answer:'hav',setAnswer:vi.fn(),locked:false,onSubmit:vi.fn(),onNext:vi.fn(),inputRef:createRef<HTMLInputElement>()};
  const view=render(<GameScreen {...props} question={rifles}/>);
  expect(screen.getByRole('button',{name:'Havoc Suppressed Assault Rifle'})).not.toBeNull();
  expect(screen.queryByRole('button',{name:'Havoc Pump Shotgun'})).toBeNull();
  view.rerender(<GameScreen {...props} round={1} question={shotguns}/>);
  expect(screen.getByRole('button',{name:'Havoc Pump Shotgun'})).not.toBeNull();
  expect(screen.queryByRole('button',{name:'Havoc Suppressed Assault Rifle'})).toBeNull();
 });
 it('fills a valid canonical answer that the submit action accepts',()=>{
  const setAnswer=vi.fn();const submitted=vi.fn();
  const props={round:0,total:7,seconds:20,score:0,setAnswer,locked:false,onNext:vi.fn(),inputRef:createRef<HTMLInputElement>()};
  const view=render(<GameScreen {...props} answer="str" question={rifles} onSubmit={()=>undefined}/>);
  fireEvent.click(screen.getByRole('button',{name:'Striker AR'}));
  expect(setAnswer).toHaveBeenCalledWith('Striker AR');
  const canonical=setAnswer.mock.calls[0][0];
  view.rerender(<GameScreen {...props} answer={canonical} question={rifles} onSubmit={()=>submitted(validateAnswer(rifles,canonical))}/>);
  fireEvent.click(screen.getByRole('button',{name:/submit/i}));
  expect(submitted).toHaveBeenCalledWith(expect.objectContaining({correct:true,canonicalAnswer:'Striker AR'}));
 });
 it('shows no suggestions before meaningful input',()=>{
  const props={round:0,total:7,seconds:20,score:0,setAnswer:vi.fn(),locked:false,onSubmit:vi.fn(),onNext:vi.fn(),inputRef:createRef<HTMLInputElement>()};
  const {container}=render(<GameScreen {...props} answer="" question={rifles}/>);
  expect(container.querySelector('.suggestions')).toBeNull();
 });
});
