import { createServer, IncomingMessage, ServerResponse } from "http";
import { parse, ParsedQuery } from "query-string";
import { PORT } from "./infrastructureVariables";
import {
  getTheDeleteRequestLogic,
  getTheGetRequestLogic,
  getThePostRequestLogic,
  getThePutRequestLogic,
  readFile,
} from "./utils";

createServer((req: IncomingMessage, res: ServerResponse) => {
  switch (req.url) {
    case "/":
      if (req.method !== "GET") {
        return res.writeHead(403, "Forbidden").end(`Error 403. Forbidden`);
      }

      return readFile(getTheGetRequestLogic, res);
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
        console.log("Body:", body);

        const parsedBody: ParsedQuery<string> = parse(body);
        if (!parsedBody.name || !parsedBody.age) {
          return res
            .writeHead(400, "Bad Request")
            .end(`Error 400. Bad Request`);
        }

        return readFile(getThePostRequestLogic, res, parsedBody);
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

        return readFile(getThePutRequestLogic, res, parsedBody);
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

        return readFile(getTheDeleteRequestLogic, res, parsedBody);
      });
      break;
    default:
      return res.writeHead(404, "Not Found").end(`Error 404. Not Found`);
  }
}).listen(PORT, () => {
  console.log("Server is running...");
});
