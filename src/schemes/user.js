const mongoose = require('mongoose');

const Data = [
	// name, minLength, maxLength, type, default, required
	'warns', null, null, Number, 0, false,
	'punishments', null, null, Number, 0, false,
];

const userSchema = [{
	_id: {
		maxLength: 18,
		minLength: 18,
		type: String,
		required: true
	}
}];

const DataCounts = 6;
for (let index = 0; index < Data.length; index += DataCounts) {
	userSchema.push({
		[Data[index]]: {
			maxLength: Data[index + 1],
			minLength: Data[index + 2],
			type: Data[index + 3],
			default: Data[index + 4],
			required: Data[index + 5]
		}
	});
}

module.exports = mongoose.model('user', mongoose.Schema(userSchema), 'users');
module.exports = { Data, DataCounts };
