const createModalCollector = async (client, listener, timeout) => {
	client.on('modalSubmit', listener);
	setTimeout(() => client.off('modalSubmit', listener), timeout);
};

module.exports.createModalCollector = createModalCollector;