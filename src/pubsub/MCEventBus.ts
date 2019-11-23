import { MCEventBusInterface, SubscriptionsContainer, Subscribers, MCEvent, Topic } from "../../types/MCEventBus";
import { topics } from "./topics";

export class MCEventBus implements MCEventBusInterface {
    public subscriptionsContainer: SubscriptionsContainer;

    constructor(subscriptionsContainer?: SubscriptionsContainer) {
        this.subscriptionsContainer = subscriptionsContainer || {};
    }

    public publish(event: MCEvent): void {
        const { topic }: MCEvent = event;
        const subscribers: Subscribers = this.subscriptionsContainer[topic] || [];
        subscribers.forEach(subscriber => {
            subscriber(event);
        });
    }

    public subscribe(topic: string, subscriber: Function): string {
        const subscriptions: Subscribers = this.subscriptionsContainer[topic];
        if (subscriptions) {
            subscriptions.push(subscriber);
        } else {
            this.subscriptionsContainer[topic] = [subscriber];
        }

        return topic;
    }

    public createEvent(desiredTopic: Topic, payload: any, successCallback: Function = null, errorCallback: Function = null): MCEvent {
        const topic: Topic | void = topics[desiredTopic];
        const timestamp: number = Date.now();

        if (!topic) {
            return null;
        }

        return {
            topic,
            payload,
            timestamp,
            successCallback,
            errorCallback,
        };
    }

    public getTopic(desiredTopic: Topic): Topic | null {
        return topics[desiredTopic] || null;
    }
}
