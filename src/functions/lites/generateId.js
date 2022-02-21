const ids = [];

const generateId = (count) => {
	const tempIds = [];

	for (let index = 0; index <= count; index++) {
		let id = Math.random().toString(16).slice(2);

		if (ids.indexOf(id) < 0) {
			tempIds.push(id);
			ids.push(id);
		} else {
			index--;
		}
	}

	return tempIds;
};

module.exports.generateId = generateId;
