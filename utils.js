/* UTILS - Add helper functions */

// Search for id
function SearchIdInArray(id, arr){
	for (var key in arr){
		if (arr[key].billId === id){
			return key;
		}
	}
	return -1;
}


module.exports.SearchIdInArray = SearchIdInArray;

