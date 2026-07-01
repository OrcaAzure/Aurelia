export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected'

export interface NetworkClient {
  status: ConnectionStatus
  connect(url: string): Promise<void>
  disconnect(): void
  send<T>(event: string, payload: T): void
}
