import { UsersType, TypeOfUser } from "../types";
import fs from "fs";
import { ServerResponse } from "http";
import { PATH_TO_JSON_FILE } from "../infrastructureVariables";
import { ParsedQuery } from "query-string";

const getNextId = (arr: UsersType): number => {
  return Math.max(...arr.map((item) => item.id)) + 1 || 1;
};

const getFilteredUsers = (users: UsersType, id: string): UsersType => {
  return users.filter((item) => item.id.toString() != id);
};

export const updateUserInformation = (
  changedUser: TypeOfUser,
  users: UsersType
): UsersType => {
  return users.map((user) => {
    if (user.id === changedUser.id) {
      return changedUser;
    }
    return user;
  });
};

export const createANewUserObject = (
  id: number,
  name: string,
  age: string
): TypeOfUser => {
  return {
    id,
    name,
    age,
  };
};

export const addNewUserToArrayUsers = (
  content: string,
  name: string,
  age: string
): UsersType => {
  const users: UsersType = JSON.parse(content);

  const newUser: TypeOfUser = createANewUserObject(
    getNextId(users),
    name,
    age
  );

  users.push(newUser);
  return users;
};

export const typeToString = (
  str: string | string[] | null | undefined
): string => {
  return str?.toString() || "";
};

export const readFile = (
  requestLogic: (
    res: ServerResponse,
    content: string,
    parsedBody?: ParsedQuery<string>
  ) => void,
  res: ServerResponse,
  parsedBody?: ParsedQuery<string>
): void => {
  fs.readFile(PATH_TO_JSON_FILE, "utf-8", (err, content) => {
    if (err) {
      return res
        .writeHead(500, "Internal Server Error")
        .end(`Error 500. Internal Server Error`);
    }
    parsedBody
      ? requestLogic(res, content, parsedBody)
      : requestLogic(res, content);
  });
};

export const getTheGetRequestLogic = (res: ServerResponse, content: string): void => {
  res
    .writeHead(200, "Ok", {
      "Content-Type": "text/json",
    })
    .end(content);
};

export const getThePostRequestLogic = (
  res: ServerResponse,
  content: string,
  parsedBody?: ParsedQuery<string>
): void => {
  const users: UsersType = addNewUserToArrayUsers(
    content,
    typeToString(parsedBody?.name),
    typeToString(parsedBody?.age)
  );

  writeNewDataToTheFile(
    res,
    users,
    201,
    "Created",
    "Data has been successfully written to file"
  );
};

export const writeNewDataToTheFile = (
  res: ServerResponse,
  newUserList: UsersType,
  status: number,
  message: string,
  responseBody: string | UsersType
): void => {
  fs.writeFile(PATH_TO_JSON_FILE, JSON.stringify(newUserList), () => {
    res.writeHead(status, message).end(responseBody);
  });
};

export const getThePutRequestLogic = (
  res: ServerResponse,
  content: string,
  parsedBody?: ParsedQuery<string>
): void => {
  const users: UsersType = JSON.parse(content);

  const changedUser: TypeOfUser = createANewUserObject(
    Number(parsedBody?.id) || 0,
    typeToString(parsedBody?.name),
    typeToString(parsedBody?.age)
  );

  const newListOfUsers: UsersType = updateUserInformation(
    changedUser,
    users
  );

  writeNewDataToTheFile(
    res,
    newListOfUsers,
    200,
    "Ok",
    "Data has been successfully changed"
  );
};

export const getTheDeleteRequestLogic = (
  res: ServerResponse,
  content: string,
  parsedBody?: ParsedQuery<string>
): void => {
  const users: UsersType = JSON.parse(content);

  const filteredUsers = getFilteredUsers(
    users,
    typeToString(parsedBody?.id)
  );

  writeNewDataToTheFile(
    res,
    filteredUsers,
    200,
    "Ok",
    "Data has been successfully deleted"
  );
};
