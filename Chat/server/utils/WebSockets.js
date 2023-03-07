import ChatHistory from '../models/ChatHistory.js';

class WebSockets {
	users = [];
	connection(client) {
		client.on("disconnect", (err) => {
				//this.users = this.users.filter((user) => user.socketId !== client.id);
				console.log("Err-"+err)
				});
		// add identity of user mapped to the socket id
		client.on("identity", (userId) => {
				this.users.push({
socketId: client.id,
userId: userId,
});
				});
// subscribe person to chat & other user as well
client.on("subscribe", (room, otherUserId = "") => {
		this.subscribeOtherUser(room, otherUserId);
		client.join(room);
		});
// mute a chat room
client.on("unsubscribe", (room) => {
		client.leave(room);
		});

client. on('class-chat-event', msg => {
		console.log("Class chat event +++",msg); 
		ChatHistory.saveMessage(msg)
		//ChatHistory.saveChat(msg);
		this.emit('class-chat-event', msg);
		//global.io.sockets.in(roomId).emit('new message', { message: post });
		});

client.on('class-attendance-event', msg => {
		console.log('class-attendance-event');
		this.emit('class-attendance-event', msg);
		//socket.broadcast.emit('class-attendance-event', msg);
		});

client.on('school-notification-event', msg => {
		//socket.broadcast.emit('school-notification-event', msg);
		console.log('class-notificaiton-event');
		this.emit('class-notificaiton-event', msg);
		});

}

subscribeOtherUser(room, otherUserId) {
	const userSockets = this.users.filter(
			(user) => user.userId === otherUserId
			);
	userSockets.map((userInfo) => {
			const socketConn = global.io.sockets.connected(userInfo.socketId);
			if (socketConn) {
			socketConn.join(room);
			}
			});
}
}

export default new WebSockets();
