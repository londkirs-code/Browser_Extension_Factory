export type MessageDefinition = { request: unknown; response: unknown };
export type MessageMap = Record<string, MessageDefinition>;

type IncomingMessage = { type?: unknown; payload?: unknown };
type MessageListener = (message: unknown, sender: unknown) => unknown;

export interface RuntimeMessagingApi {
  sendMessage(message: unknown): Promise<unknown>;
  onMessage: {
    addListener(listener: MessageListener): void;
    removeListener?(listener: MessageListener): void;
  };
}

export function createMessenger<M extends MessageMap>(runtime: RuntimeMessagingApi) {
  return {
    async send<K extends keyof M & string>(
      type: K,
      payload: M[K]["request"],
    ): Promise<M[K]["response"]> {
      return (await runtime.sendMessage({ type, payload })) as M[K]["response"];
    },

    on<K extends keyof M & string>(
      type: K,
      handler: (
        payload: M[K]["request"],
        sender: unknown,
      ) => M[K]["response"] | Promise<M[K]["response"]>,
    ): () => void {
      const listener: MessageListener = (message, sender) => {
        if (!message || typeof message !== "object") return undefined;
        const incoming = message as IncomingMessage;
        if (incoming.type !== type) return undefined;
        return handler(incoming.payload as M[K]["request"], sender);
      };
      runtime.onMessage.addListener(listener);
      return () => runtime.onMessage.removeListener?.(listener);
    },
  };
}
