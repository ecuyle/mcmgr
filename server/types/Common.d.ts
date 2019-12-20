import { Request, Response } from 'express';
import { Logger } from 'pino';
import * as express from 'express';

export interface VersionDownloadDetails {
    sha1: string;
    size: number;
    url: string;
}

export interface SrvBaseResponse {
    req: Request,
    res: Response,
    methodSrc: string,
    statusCode: number;
    logger: Logger,
}
export interface SrvSuccessResponse extends SrvBaseResponse {
    msg: any,
}

export interface SrvErrorResponse extends SrvBaseResponse {
    e: Error,
}

export interface RouterWs extends express.Router {
  ws(route: string, ...cb: any[]): RouterWs;
}
