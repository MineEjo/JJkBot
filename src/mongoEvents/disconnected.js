module.exports = {
    name: 'disconnected',
    async execute() {
        console.error("[Mongodb] Disconnected from database.");
    },
};