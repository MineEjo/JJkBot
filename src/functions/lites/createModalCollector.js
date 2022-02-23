export async function createModalCollector(client, listener, timeout) {
	client.on('modalSubmit', listener);
	setTimeout(() => client.off('modalSubmit', listener), timeout);
}
