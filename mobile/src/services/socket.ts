import { io, Socket } from 'socket.io-client';
import { API_BASE_URL } from '../constants';

class SocketService {
  private socket: Socket | null = null;

  connect(token: string) {
    if (!this.socket) {
      this.socket = io(API_BASE_URL, {
        auth: { token },
        transports: ['websocket'],
      });
    }
    return this.socket;
  }

  getSocket() {
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  emit(event: string, data?: any) {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }

  on(event: string, callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event: string) {
    if (this.socket) {
      this.socket.off(event);
    }
  }
}

export const socketService = new SocketService();
