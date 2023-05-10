import daysFromStart from "./days-from-start.js";
import findWorldDataFiles from "./find-world-data-files.js";
import { WorldWithWorldData, WorldDataState } from "../public/scripts/Types";

const getWorldDataState = function (
  worldsWithWorldData: WorldWithWorldData[],
  worldDataFiles: ReturnType<typeof findWorldDataFiles>
) {
  const state: WorldDataState[] = [];
  for (const world of worldsWithWorldData) {
    const startTimestamp = new Date(world.start_timestamp * 1000);
    const numberOfTurns = daysFromStart(startTimestamp);
    const addedWorld: WorldDataState = {
      id: world.id,
      serverName: world.server + world.num,
      turns: Array(numberOfTurns)
        .fill(null)
        .map(() => ({
          id: -1,
          hasFiles: false,
        })),
    };
    for (const worldDataTurn of world.world_data) {
      const currentTurn = addedWorld.turns[worldDataTurn.turn];
      if (currentTurn) currentTurn.id = worldDataTurn.id;
      if (worldDataFiles[world.id][worldDataTurn.turn] === true) currentTurn.hasFiles = true;
    }
    state.push(addedWorld);
  }
  return state;
};

export default getWorldDataState;
