
const YGPrCore = function() {

};

YGPrCore.prototype.generateYearPlannerForYear = function(year) {
	const yearData = [];
	for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
		const monthStartDate = new Date(`${year}-${monthIndex + 1}`);
		yearData[monthIndex] = new Array(daysInMonth(monthIndex + 1, year)).fill(0);
		for (let dayIndex = 0; dayIndex < yearData[monthIndex].length; dayIndex++) {
			yearData[monthIndex][dayIndex] = new Date(`${year}-${monthIndex + 1}-${dayIndex + 1}`).getDay();
		}
	}
	// console.log(mapDayIndexToDay(yearData));
	console.log(yearData);
	return yearData;
};

YGPrCore.dayMap = [
	'Sunday    ',
	'Monday    ',
	'Tuesday   ',
	'Wednesday ',
	'Thursday  ',
	'Friday    ',
	'Saturday  '
];


function mapDayIndexToDay(yearData) {
	for(let monthIndex = 0; monthIndex < 12; monthIndex++) {
		for (let dayIndex = 0; dayIndex < yearData[monthIndex].length; dayIndex++) {
			yearData[monthIndex][dayIndex] = YGPrCore.dayMap[yearData[monthIndex][dayIndex]];
		}
	}
	return yearData;
}

function daysInMonth (month, year) {
	return new Date(year, month, 0).getDate();
}