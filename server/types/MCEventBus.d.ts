import { MCFMInterface } from "./MCFileManager";

export interface MCEventBusInterface {
    subscriptionsContainer: SubscriptionsContainer;

    publish(event: MCEvent): void;
    subscribe(topic: string, subscriber: Function): string;
    createEvent(desiredTopic: Topic, payload: any, successCallback?: Function | null, errorCallback?: Function | null): MCEvent;
    getTopic(desiredTopic: Topic): Topic | null;
}

export interface MCEvent {
    topic: Topic,
    payload: any,
    timestamp: number,
    successCallback?: Function | null;
    errorCallback?: Function | null;
}

export type Topics = Record<string, Topic>

export type SubscriptionsContainer = Record<Topic, Subscribers>;
export type Topic = string;
export type Subscribers = Array<Function>;
