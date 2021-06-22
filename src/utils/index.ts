import { UsersType } from "../types";


export const getNextId = (arr: UsersType): number => {
  return Math.max(...arr.map((item) => item.id)) + 1 || 1;
};

export const getFilteredUsers = (users: UsersType, id: string): UsersType => {
  return users.filter((item) => item.id.toString() != id);
};