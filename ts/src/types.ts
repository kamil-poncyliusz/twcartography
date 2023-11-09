import { Collection, CreatedAnimation, CreatedMap, User, World } from "@prisma/client";

export interface MarkGroup {
  tribes: string[];
  name: string;
  color: string;
}
export interface Settings {
  backgroundColor: string;
  borderColor: string;
  captions: Caption[];
  drawBorders: boolean;
  drawLegend: boolean;
  legendFontSize: number;
  markGroups: MarkGroup[];
  outputWidth: number;
  scale: number;
  smoothBorders: boolean;
  trim: boolean;
  topSpotSize: number;
  turn: number;
  world: number;
}
export interface ParsedColor {
  r: number;
  g: number;
  b: number;
}
export interface Caption {
  text: string;
  color: string;
  fontSize: number;
  x: number;
  y: number;
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
  averageVillagePoints: number;
  medianVillagePoints: number;
  topVillagePoints: number;
}
export type CreatedMapWithRelations = CreatedMap & {
  collection: Collection;
};
export type WorldWithWorldData = World & { worldData: { id: number; turn: number }[] };
export type UserWithRelations = User & {
  collections: Collection[];
};
export type CollectionWithRelations = Collection & {
  animations: CreatedAnimation[];
  author: User;
  maps: CreatedMap[];
  world: World;
};
export type CreatedAnimationWithRelations = CreatedAnimation & {
  collection: Collection;
};
export interface WorldDataState {
  filesDirectoryName: string;
  id: number;
  serverName: string;
  turns: TurnDataState[];
}
export interface TurnDataState {
  hasDataFiles: boolean;
  isParsed: boolean;
}
export interface UserSessionData {
  id: number;
  login: string;
  rank: number;
}
export interface CreateMapRequestPayload {
  collection: number;
  description: string;
  settings: Settings;
  title: string;
}
export type CreateWorldRequestPayload = Omit<World, "id">;
export interface ReadCollectionsRequestPayload {
  page: number;
  authorId: number;
  worldId: number;
}
export interface CreateMapResponse {
  success: boolean;
  newCollection?: {
    id: number;
    title: string;
    worldId: number;
  };
}
