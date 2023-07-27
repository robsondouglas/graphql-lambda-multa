import ITopic, { ActionType } from "./models";

export default class Mocked implements ITopic {
    async publish(topicName: string, action:ActionType, data: any): Promise<void> {
        console.log(topicName, action, data);    
    }
}