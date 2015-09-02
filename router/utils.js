// Search for id
function searchId(id){
	for (var key in bills){
		if (bills[key].billId === id){
			return key;
		}
	}
	return -1;
}

var utils = module.exports;