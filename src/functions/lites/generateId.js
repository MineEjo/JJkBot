const ids = [];

const generateId = () => {
	for (let index = 0; index < 1; index++) {
		let id = Math.random().toString(16).slice(2);

		if (ids.indexOf(id) < 0) {
			ids.push(id);
			return id;
		} else {
			index--;
		}
	}
};

module.exports.generateId = generateId;
