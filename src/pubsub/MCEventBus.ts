import { MCFMInterface } from "../../types/MCFileManager";
import { MCEventBusInterface, SubscriptionsContainer, Subscribers, MCEvent, Topic } from "../../types/MCEventBus";
import { topics } from "./topics";

export class MCEventBus implements MCEventBusInterface {
    mcfm: MCFMInterface;
    subscriptionsContainer: SubscriptionsContainer;

    constructor(mcfm: MCFMInterface) {
        this.mcfm = mcfm;
        this.subscriptionsContainer = {};
    }

    publish(event: MCEvent): void {
        const { topic }: MCEvent = event;
        const subscribers: Subscribers = this.subscriptionsContainer[topic];
        subscribers.forEach(subscriber => {
            subscriber(event);
        });
    }

    subscribe(topic: string, subscriber: Function): string {
        const subscriptions: Subscribers = this.subscriptionsContainer[topic];
        if (subscriptions) {
            subscriptions.push(subscriber);
        } else {
            this.subscriptionsContainer[topic] = [subscriber];
        }

        return topic;
    }

    createEvent(desiredTopic: Topic, payload: any): MCEvent {
        const topic: Topic | void = topics[desiredTopic];
        const timestamp: number = Date.now();

        if (!topic) {
            return null;
        }

        return {
            topic,
            payload,
            timestamp,
        };
    }
}
