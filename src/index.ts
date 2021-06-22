import { createServer, IncomingMessage, ServerResponse } from "http";
import fs from "fs";
import { parse, ParsedQuery } from "query-string";
import { pathToJsonFile, port } from "./infrastructureVariables";
import { UsersType, typeOfUser } from "./types";
import { getNextId, getFilteredUsers } from "./utils";

createServer((req: IncomingMessage, res: ServerResponse) => {
  switch (req.url) {
    case "/":
      if (req.method !== "GET") {
        return res.writeHead(403, "Forbidden").end(`Error 403. Forbidden`);
      }
      fs.readFile(pathToJsonFile, "utf-8", (err, content) => {
        if (err) {
          return res
            .writeHead(500, "Internal Server Error", {
              "Content-Type": "text/plain",
            })
            .end(`Error 500. Internal Server Error`);
        }
        res
          .writeHead(200, "Ok", {
            "Content-Type": "text/json",
          })
          .end(content);
      });
      break;
    case "/post":
      res.setHeader("content-type", "text/plain");

      if (req.method !== "POST") {
        return res.writeHead(403, "Forbidden").end(`Error 403. Forbidden`);
      }

      let body = "";
      req.on("data", (chunk) => {
        body += chunk.toString();
      });

      req.on("end", () => {
        const parsedBody: ParsedQuery<string> = parse(body);
        if (!parsedBody.name || !parsedBody.age) {
          return res
            .writeHead(400, "Bad Request")
            .end(`Error 400. Bad Request`);
        }

        fs.readFile(pathToJsonFile, "utf-8", (err, content) => {
          if (err) {
            return res
              .writeHead(500, "Internal Server Error")
              .end(`Error 500. Internal Server Error`);
          }

          const users: UsersType = JSON.parse(content);
          const newUser: typeOfUser = {
            id: getNextId(users),
            name: parsedBody.name?.toString() || "",
            age: parsedBody.age?.toString() || "",
          };
          users.push(newUser);

          fs.writeFile(pathToJsonFile, JSON.stringify(users), () => {
            return res
              .writeHead(201, "Created")
              .end(`Data has been successfully written to file`);
          });
        });
      });
      break;
    case "/put":
      res.setHeader("content-type", "text/plain");

      if (req.method !== "PUT") {
        return res.writeHead(403, "Forbidden").end(`Error 403. Forbidden`);
      }

      let bodyOfPut = "";
      req.on("data", (chunk) => {
        bodyOfPut += chunk.toString();
      });

      req.on("end", () => {
        const parsedBody: ParsedQuery<string> = parse(bodyOfPut);

        if (!parsedBody.id || !parsedBody.name || !parsedBody.age) {
          return res
            .writeHead(400, "Bad Request")
            .end(`Error 400. Bad Request`);
        }

        fs.readFile(pathToJsonFile, "utf-8", (err, content) => {
          if (err) {
            return res
              .writeHead(500, "Internal Server Error")
              .end(`Error 500. Internal Server Error`);
          }

          const users: UsersType = JSON.parse(content);

          const changedUser: typeOfUser = {
            id: Number(parsedBody.id) || 0,
            name: parsedBody.name?.toString() || "",
            age: parsedBody.age?.toString() || "",
          };
          const newListOfUsers = users.map((user) => {
            if (user.id === changedUser.id) {
              return changedUser;
            }
            return user;
          });

          fs.writeFile(pathToJsonFile, JSON.stringify(newListOfUsers), () => {
            return res
              .writeHead(201, "Created")
              .end(`Data has been successfully changed`);
          });
        });
      });
      break;
    case "/delete":
      res.setHeader("content-type", "text/plain");
      if (req.method !== "DELETE") {
        return res.writeHead(403, "Forbidden").end(`Error 403. Forbidden`);
      }

      let bodyOfDelete = "";
      req.on("data", (chunk) => {
        bodyOfDelete += chunk.toString();
      });

      req.on("end", () => {
        const parsedBody: ParsedQuery<string> = parse(bodyOfDelete);

        if (!parsedBody.id) {
          return res
            .writeHead(400, "Bad Request")
            .end(`Error 400. Bad Request`);
        }

        fs.readFile(pathToJsonFile, "utf-8", (err, content) => {
          if (err) {
            return res
              .writeHead(500, "Internal Server Error")
              .end(`Error 500. Internal Server Error`);
          }

          const users: UsersType = JSON.parse(content);

          const filteredUsers = getFilteredUsers(
            users,
            parsedBody.id?.toString() || ""
          );

          fs.writeFile(pathToJsonFile, JSON.stringify(filteredUsers), () => {
            return res
              .writeHead(200, "Ok")
              .end(`Data has been successfully deleted`);
          });
        });
      });
      break;
    default:
      return res.writeHead(404, "Not Found").end(`Error 404. Not Found`);
  }
}).listen(port, () => {
  console.log("Server is running...");
});
