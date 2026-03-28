import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { gameActions } from '../store/gameSlice';

export const useGameLoop = () => {
  const dispatch = useDispatch<AppDispatch>();
  const playerExp = useSelector((state: RootState) => state.game.player.exp);
  const expToNext = useSelector((state: RootState) => state.game.player.expToNext);

  useEffect(() => {
    if (playerExp >= expToNext) {
      dispatch(gameActions.levelUp());
    }
  }, [playerExp, expToNext, dispatch]);
};
