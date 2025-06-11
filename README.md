# Real-Time Chat Application

## Overview
This project implements a robust real-time chat application using Socket.IO for seamless bi-directional communication between clients and the server. Built on Node.js with Express.js as the foundation, it leverages MongoDB for data persistence and implements caching strategies for optimal performance.

## Architecture

### Core Components
- **Express.js Server**: Provides the foundation for the application
- **Socket.IO**: Enables real-time, bidirectional communication
- **MongoDB**: Stores messages, user information, and conversation data

### Event-Driven Architecture
The application follows an event-driven architecture with these key events:

- **join_chat**: Fires when a user enters a chat room, adding them to the participant list and broadcasting their arrival
- **send_message**: Triggers when a user sends a message, saving it to MongoDB and delivering it to recipients in real-time
- **receive_message**: Handles incoming messages on the client side
- **leave_chat**: Manages user exits from chat rooms


### Data Flow
1. **Connection**: Clients connect to the Socket.IO server
2. **Room Joining**: Clients join chat rooms using their user IDs
3. **Message Exchange**: Messages are persisted in MongoDB and delivered in real-time
4. **Presence Management**: Active users are tracked and their status is broadcast to all clients

## Features
- **Real-Time Communication**: Instant messaging between connected clients
- **Group Chat**: Create and manage group chats with multiple participants
- **User Management**: Add or remove participants from group chats
- **Message Broadcasting**: Messages sent by a user are broadcasted to all participants in the chatroom
- **Caching**: In-memory caching for chat history and active users
- **Presence Awareness**: Real-time tracking of online users

### Chat Controller
The chat controller manages connections, message exchange, and user presence:

- **Active Users Map**: Tracks connected users and their sockets
- **Chat History Cache**: Stores recently accessed conversations for quick retrieval
- **Event Handlers**: Processes join_chat, send_message, and disconnect events

## Requirements
- Node.js
- npm (Node Package Manager)
- MongoDB

## Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/Yash-finwiz/Real-Time-Chat-App.git
   ```
2. Navigate to the project directory:
   ```bash
   cd Real-Time-Chat-App
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create a `.env` file with the following variables:
   ```
   PORT=4000
   MONGO_URL=mongodb://localhost:27017/chat-app
   ```

## Running the Server
- Development mode:
  ```bash
  npm run dev
  ```
- Production mode:
  ```bash
  npm start
  ```

## File Structure
- `server.js`: Entry point for the application
- `controllers/`: Contains business logic for handling requests
- `models/`: Defines data schemas for MongoDB
- `routes/`: Defines API endpoints
- `services/`: Contains reusable service functions
- `socketHandlers.js`: Manages socket connections and events

## Testing with Postman

You can use Postman to test the socket connections and APIs. Below are the steps and sample payloads for testing different functionalities:

### 1. Join the Socket
- **Event**: `join`
- **Payload**:
  ```json
  {
      "userId": "684818992f9ef3a8b7091d70"
  }
  ```

### 2. Send Messages
- **Event**: `sendMessage`
- **Payload**:
  ```json
  {
      "data": {
          "senderId": "684818992f9ef3a8b7091d70",
          "receiverId": "68481afb2f9ef3a8b7091d74",
          "content": "Hello, this is a test message..."
      }
  }
  ```

### 3. Create Group
- **Event**: `createGroup`
- **Payload**:
  ```json
  {
      "data": {
          "groupName": "Test Group",
          "participants": ["684818992f9ef3a8b7091d70", "68481afb2f9ef3a8b7091d74","68481d2b9d2cf768b3801186"],
          "groupAdmin": "684818992f9ef3a8b7091d70"
      }
  }
  ```

### 4. Send Group Message
- **Event**: `sendGroupMessage`
- **Payload**:
  ```json
  {
      "data": {
          "groupId": "68482ff93b7208312b649558",
          "senderId": "684818992f9ef3a8b7091d70",
          "content": "Hello, this is a test group message"
      }
  }
  ```

### 5. Add Participants
- **Event**: `addParticipants`
- **Payload**:
  ```json
  {
      "data": {
          "groupId": "68482ff93b7208312b649558",
          "adminId": "684818992f9ef3a8b7091d70",
          "participants": ["684861028a8db36b39e088f8"]
      }
  }
  ```
### 6. Remove Participants
- **Event**: `removeParticipants`
- **Payload**:
  ```json
  {
      "data": {
          "groupId": "6649558",
          "adminId": "684818992f9ef3a8b7091d70",
          "participants": ["684861028a8db36b39e088f8"]
      } 
  }

## Scaling Considerations

### Redis for Enhanced Caching
As the application scales, consider implementing Redis for:
- Chat history caching
- Active user tracking
- Pub/Sub for real-time message delivery

### Load Balancing and Horizontal Scaling
- Distribute traffic across multiple servers using load balancers
- Consider cloud platforms like AWS or Google Cloud for managed services
- Implement horizontal scaling by adding more server instances

### Microservices Architecture
For larger applications, consider breaking down into microservices:
- User management service
- Chat history service
- Message delivery service

## Best Practices

1. **Event Naming**: Use descriptive and consistent event names
2. **Error Handling**: Implement robust error handling for all operations
3. **Security**: Implement authentication, authorization, and data encryption
4. **Performance Monitoring**: Track system performance and optimize as needed

## Contributing
Contributions are welcome! Please open an issue or submit a pull request for any improvements.

## License
This project is licensed under the MIT License.