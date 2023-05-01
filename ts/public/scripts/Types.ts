import { Request } from "express";

export interface MarkGroup {
  tribes: string[];
  name: string;
  color: string;
}
export interface Settings {
  backgroundColor: string;
  markGroups: MarkGroup[];
  radius: number;
  scale: number;
  spotsFilter: number;
  spotSize: number;
  turn: number;
  villageFilter: number;
  world: number;
}
export interface ParsedColor {
  r: number;
  g: number;
  b: number;
}
export interface ImageDataDummy {
  data: Uint8ClampedArray;
  width: number;
  height: number;
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
}
export interface ReadMapsParameters {
  author: number | undefined;
  order: "newest" | "oldest" | "views";
  timespan: "day" | "week" | "month" | "any";
  world: number | undefined;
}
export interface Authorized {
  id: number;
  login: string;
  rank: number;
}
export interface AuthorizedRequest extends Request {
  authorized?: Authorized;
}
export interface MapLoaderSettings {
  author: number;
  order: string;
  timespan: string;
  world: number;
}
