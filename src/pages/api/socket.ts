import { Server } from 'socket.io';

let io;

export default function handler(req, res) {
  if (!io) {
    io = new Server(res.socket.server);
    res.socket.server.io = io;

    io.on('connection', (socket) => {
      console.log('Client connected');

      // Listen for audio data from the client
      socket.on('audioData', async (_audioBuffer) => {
        try {
          const transcript = await transcribeAudio(_audioBuffer);
          socket.emit('transcription', transcript);
        } catch (error) {
          console.error('Error processing audio:', error);
        }
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected');
      });
    });
  }
  res.end();
}

async function transcribeAudio(_audioBuffer:any) {
  // Replace this with actual transcription API or logic
  return "Transcribed text here";
}
