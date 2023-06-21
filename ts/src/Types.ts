import { CreatedMap, User, World } from "@prisma/client";

export interface MarkGroup {
  tribes: string[];
  name: string;
  color: string;
}
export interface Settings {
  backgroundColor: string;
  borderColor: string;
  displayUnmarked: boolean;
  markGroups: MarkGroup[];
  outputWidth: number;
  scale: number;
  spotsFilter: number;
  spotSizeStep: number;
  trim: boolean;
  turn: number;
  unmarkedColor: string;
  villageFilter: number;
  world: number;
}
export interface ParsedColor {
  r: number;
  g: number;
  b: number;
}
export interface Tribe {
  id: string;
  name: string;
  tag: string;
  points: number;
  players: number;
  killAll: number;
  killAtt: number;
  killDef: number;
  villages: Village[];
}
export interface Village {
  tribeId: string;
  x: number;
  y: number;
  points: number;
}
export interface ParsedTurnData {
  conquer: Object;
  tribes: { [key: string]: Tribe };
  width: number;
  topVillagePoints: number;
}
export interface MapLoaderSettings {
  author: number;
  order: string;
  timespan: string;
  world: number;
}
export type CreatedMapWithRelations = CreatedMap & {
  author: User;
  world: World;
};
export type WorldWithWorldData = World & { worldData: { id: number; turn: number }[] };
export interface TurnDataState {
  id: number;
  hasFiles: boolean;
}
export interface WorldDataState {
  id: number;
  serverName: string;
  turns: TurnDataState[];
}
export interface UserSessionData {
  id: number;
  login: string;
  rank: number;
}
