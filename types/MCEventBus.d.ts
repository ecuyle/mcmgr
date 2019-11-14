import { MCFMInterface } from "./MCFileManager";

export interface MCEventBusInterface {
    mcfm: MCFMInterface;
}

export interface MCEvent {
    topic: Topic,
    payload: any,
    timestamp: number,
}

export type SubscriptionsContainer = Record<Topic, Subscribers>;
export type Topic = string;
export type Subscribers = Array<Function>;
