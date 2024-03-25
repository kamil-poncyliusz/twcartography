import { Collection, CreatedAnimation, CreatedMap, Server, User, World } from "@prisma/client";

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
  day: number;
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
export type WorldWithWorldData = World & { worldData: { id: number; day: number }[] };
export type UserWithRelations = User & {
  collections: Collection[];
};
export type ServerWithWorlds = Server & { worlds: World[] };
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
  name: string;
  id: number;
  days: { [key: string]: TurnDataState };
}
export interface TurnDataState {
  hasDataFiles: boolean;
  isParsed: boolean;
  dateString: string;
}
export interface UserSessionData {
  id: number;
  login: string;
  rank: number;
}
export interface CreateMapRequestPayload {
  collectionId: number;
  description: string;
  settings: Settings;
  title: string;
}
export interface ReadCollectionsRequestFilters {
  page: number;
  authorId: number;
  worldId: number;
}
export type CreateServerRequestPayload = Omit<Server, "id" | "active">;
export interface CreateMapResponse {
  success: boolean;
  newCollection?: {
    id: number;
    title: string;
    worldId: number;
  };
}
export interface Translation {
  homepage: string;
  collections: string;
  newMap: string;
  adminPanel: string;
  settings: string;
  marks: string;
  captions: string;
  loggedInAs: string;
  myCollections: string;
  logout: string;
  profile: string;
  loginForm: string;
  login: string;
  password: string;
  logIn: string;
  register: string;
  rank: string;
  changeRank: string;
  choose: string;
  world: string;
  any: string;
  title: string;
  deleteCollection: string;
  deleteMap: string;
  createdBy: string;
  mapSettings: string;
  animationCreatorMode: string;
  checkAll: string;
  uncheckAll: string;
  createAnimation: string;
  timeInMilliseconds: string;
  frameInterval: string;
  server: string;
  servers: string;
  number: string;
  domain: string;
  startTime: string;
  endTime: string;
  closeDown: string;
  delete: string;
  add: string;
  turn: string;
  parsedDataAvailable: string;
  parsedDataUnavailable: string;
  filesAvailable: string;
  filesUnavailable: string;
  worlds: string;
  users: string;
  dataAvailability: string;
  backgroundColor: string;
  scale: string;
  spotSize: string;
  trim: string;
  smoothBorders: string;
  drawBorders: string;
  drawLegend: string;
  generate: string;
  description: string;
  chooseCollection: string;
  addToCollection: string;
  createNewCollection: string;
  autoRefresh: string;
  worldTooltip: string;
  dayTooltip: string;
  backgroundColorTooltip: string;
  scaleTooltip: string;
  spotSizeTooltip: string;
  trimTooltip: string;
  smoothBordersTooltip: string;
  drawBordersTooltip: string;
  drawLegendTooltip: string;
  autoRefreshTooltip: string;
  mapSettingsTooltip: string;
  name: string;
  search: string;
  tribes: string;
  villages: string;
  points: string;
  color: string;
  players: string;
  text: string;
  size: string;
  markGroupColorInputTooltip: string;
  waiting: string;
  errorOccurred: string;
  mapAddedToCollection: string;
  createNewGroup: string;
  newCollection: string;
  noDescription: string;
  updateHour: string;
  activate: string;
  deactivate: string;
  hour: string;
  day: string;
}
