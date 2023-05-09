import daysFromStart from "./days-from-start.js";
import { worldWithWorldData } from "../public/scripts/Types";

interface TurnDataState {
  id: number;
  hasFiles: boolean;
}

interface WorldDataState {
  id: number;
  serverName: string;
  turns: TurnDataState[];
}

const getWorldDataState = function (worldsWithWorldData: worldWithWorldData[]) {
  const state: WorldDataState[] = [];
  const startingTurnDataState = {
    id: -1,
    hasFiles: false,
  };
  for (const world of worldsWithWorldData) {
    const startTimestamp = new Date(world.start_timestamp * 1000);
    const numberOfTurns = daysFromStart(startTimestamp);
    const addedWorld: WorldDataState = {
      id: world.id,
      serverName: world.server + world.num,
      turns: Array(numberOfTurns)
        .fill(null)
        .map(() => ({ ...startingTurnDataState })),
    };
    for (const worldDataTurn of world.world_data) {
      const currentTurn = addedWorld.turns[worldDataTurn.turn];
      if (currentTurn) currentTurn.id = worldDataTurn.id;
    }
    state.push(addedWorld);
  }
  return state;
};

export default getWorldDataState;
