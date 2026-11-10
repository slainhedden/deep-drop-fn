import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import App from './App';
import {generateGame,dailySeed} from './engine/questions';
import {entitiesById} from './data/entities';

describe('playable UI',()=>{
  beforeEach(()=>localStorage.clear());
  it('opens the daily drop, starts a game and locks the first answer',()=>{
    render(<App/>);
    expect(screen.getByRole('heading',{name:/daily fortnite trivia game/i})).not.toBeNull();
    fireEvent.click(screen.getByRole('button',{name:/play today/i}));
    fireEvent.click(screen.getByRole('button',{name:/start game/i}));
    const input=screen.getByRole('textbox',{name:/your answer/i});
    fireEvent.change(input,{target:{value:entitiesById.get(generateGame(dailySeed(),7)[0].validAnswerIds[0])!.name}});
    fireEvent.click(screen.getByRole('button',{name:/submit/i}));
    expect(screen.getByRole('button',{name:/next question/i})).not.toBeNull();
  });
});
