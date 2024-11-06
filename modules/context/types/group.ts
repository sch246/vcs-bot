import { Area } from "../types";
import { User } from "./user";

export interface Group extends Area {
  type: 'group';
  members: User[];
}
