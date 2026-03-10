export const setupCodePairSocket = (io) => {
    // Determine the namespace or use the main one. Since we need it to be isolated,
    // we'll try to just listen on connection but filter by a namespace or just specific events.
    // The main connection event is handled in lib/socket.js. 
    // Wait, since we are attaching to the existing IO instance, we can register an io.on("connection") handler here.
    
    // In-memory simple store for CodePair rooms
    const codepairRooms = new Map();

    io.on("connection", (socket) => {
        // --- CodePair Events ---
        
        socket.on("codepair:join", ({ roomId, user }) => {
            socket.join(`codepair-${roomId}`);
            
            if (!codepairRooms.has(roomId)) {
                codepairRooms.set(roomId, {
                    code: "// Welcome to CodePair\n\n",
                    language: "javascript",
                    participants: new Map()
                });
            }
            
            const room = codepairRooms.get(roomId);
            room.participants.set(socket.id, user);
            
            // Send current state to newly joined user
            socket.emit("codepair:init", {
                code: room.code,
                language: room.language,
                participants: Array.from(room.participants.values())
            });
            
            // Notify others
            socket.to(`codepair-${roomId}`).emit("codepair:user-joined", {
                participants: Array.from(room.participants.values())
            });
            
            // Track which codepair room this socket is in
            socket.codepairRoomId = roomId;
        });

        socket.on("codepair:code-update", ({ roomId, code, language }) => {
            const room = codepairRooms.get(roomId);
            if (room) {
                room.code = code;
                if (language) room.language = language;
                
                socket.to(`codepair-${roomId}`).emit("codepair:code-sync", { code, language });
            }
        });

        socket.on("codepair:chat", ({ roomId, message }) => {
            socket.to(`codepair-${roomId}`).emit("codepair:chat-message", message);
        });

        // The main socket disconnect handler might also exist in another file, 
        // but adding this specifically for the codepair cleanup.
        socket.on("disconnect", () => {
            if (socket.codepairRoomId) {
                const roomId = socket.codepairRoomId;
                const room = codepairRooms.get(roomId);
                
                if (room) {
                    room.participants.delete(socket.id);
                    
                    io.to(`codepair-${roomId}`).emit("codepair:user-left", {
                        participants: Array.from(room.participants.values())
                    });
                    
                    // Cleanup empty rooms
                    if (room.participants.size === 0) {
                        codepairRooms.delete(roomId);
                    }
                }
            }
        });
    });
};
