const Excel = require('exceljs');

function populateYearSelector() {
	const currentYear = new Date().getFullYear();
	let years = new Array(20).fill(0);
	years = years.map((value, index) => {
		return `${currentYear + index}`;
	});
	const yearSelector = $('#year-selector');
	years.forEach(year => {
		let optionString = `<option value=${year}>${year}</option>`;
		if (currentYear === year) {
			optionString = `<option value=${year} selected>${year}</option>`;
		}
		yearSelector.append(
			optionString
		);
	});

}
populateYearSelector();

$(document).ready(function() {
	$('#year-selector').change(function() {
		createWorkbookForYear($(this).val() || new Date().getFullYear());
	})
	$('#generate-year-plan').click(function() {
		downloadYearPlan($('#year-selector').val() || new Date().getFullYear())
	});
	// Init Webworker.
	initWebWorker();
	createWorkbookForYear($('#year-selector').val() || new Date().getFullYear());
});

function initWebWorker() {
	if (window.Worker) {
		window.ypgrCoreWorker = new Worker('ypgrcore.webworker.js');
		window.ypgrCoreWorker.onmessage = YPGrWorkerMessageHandler;
	}
}

/* recieves data from webworker */
function YPGrWorkerMessageHandler(event) {

}

function getMaxWeeksAndMaxDay(yearData) {
	// get wether 5 week in a month or 4 week
	const weeksCount = yearData.map(month => {
		var weekCount = 0;
		month.forEach(day => {
			if (day == 6) {
				weekCount++;
			}
		});
		return weekCount;
	});
	var lastDayOfMonth = [];
	weeksCount.forEach((count, index) => {
		// for all month havving 5 week or more, find out which has last day as not sunday pr saturday.
		if (count >= 5) {
			// 0 being sunday, 6 being saturday.
			if (yearData[index][yearData[index].length - 1] === 6 || yearData[index][yearData[index].length - 1] === 0) {
				lastDayOfMonth.push(-1);
			} else {
				lastDayOfMonth.push(yearData[index][yearData[index].length - 1]);
			}
		} else {
			lastDayOfMonth.push(-1);
		}
	})
	// console.log('weeksCount', weeksCount, lastDayOfMonth);
	// Days to add at the end will depend on the MaxValue of lastDayOfMonth
	// say if it's tuesday add 2 more days after sunday.
	return Math.max(...lastDayOfMonth);
}

/* Uses a webworker if window.Worker exists other wise does calculation on main thread. */
function createWorkbookForYear(year) {
	// window.workbook = XLSX.utils.book_new();
	window.workbook = new Excel.Workbook();

	// XLSX.utils.aoa_to_sheet
	// delete to WebWorker so main thread is free.
	if (!window.ypgrCoreWorker) {
		window.ypgrCoreWorker.postMessage({

		});
	} else {
		// if no window worker, use ypgrcore functions directly. 
		const ypgrCore = new YGPrCore();
		const yearData = ypgrCore.generateYearPlannerForYear(year);
		let daysTop = [];
		for (let i = 0 ; i < 5; i++) {
			daysTop = daysTop.concat(YGPrCore.dayMap);
		}
		daysTop = daysTop.concat(YGPrCore.dayMap.slice(0, 1));
		const daysToAdd = getMaxWeeksAndMaxDay(yearData);
		console.log('daysToAdd', daysToAdd);
		if (daysToAdd != -1) {
			daysTop = daysTop.concat(YGPrCore.dayMap.slice(1, (daysToAdd + 1)%6));
		}
		// use 5 and find the lastEndDay and show till that date.
		let emptyBlocksAtStart = yearData[0][0];
		let emptyBlocksAtEnd = yearData[0][yearData[0].length - 1];
		console.log(yearData[0][0]);
		const yearSheetData = [
			[].concat([' '], daysTop),
			[].concat(['January'], generateConcatArray(yearData, 0)),
			[].concat(['February'], generateConcatArray(yearData, 1)),
			[].concat(['March'], generateConcatArray(yearData, 2)),
			[].concat(['April'], generateConcatArray(yearData, 3)),
			[].concat(['May'], generateConcatArray(yearData, 4)),
			[].concat(['June'], generateConcatArray(yearData, 5)),
			[].concat(['July'], generateConcatArray(yearData, 6)),
			[].concat(['August'], generateConcatArray(yearData, 7)),
			[].concat(['September'], generateConcatArray(yearData, 8)),
			[].concat(['October'], generateConcatArray(yearData, 9)),
			[].concat(['November'], generateConcatArray(yearData, 10)),
			[].concat(['December'], generateConcatArray(yearData, 11))
		];
		console.log(yearSheetData);
		console.log(yearData[11]);
		// const worksheet = XLSX.utils.aoa_to_sheet(yearSheetData);
		// XLSX.utils.book_append_sheet(window.workbook, worksheet,'Planner');
		const worksheet = workbook.addWorksheet('Planner');
		worksheet.pageSetup.orientation = 'landscape';
		worksheet.addRows(yearSheetData);

		/*
		// Iterate over all rows (including empty rows) in a worksheet
		worksheet.eachRow({ includeEmpty: true }, function(row, rowNumber) {
			console.log('Row ' + rowNumber + ' = ' + JSON.stringify(row.values));
			row.fill = {
				type: 'pattern',
				pattern: 'solid',
				fgColor: {
					argb: 'FFFFFF00'
				},
				bgColor: {
					argb: 'FFFFFF00'
				}

			};
		});

		// Iterate over all non-null cells in a row
		row.eachCell(function(cell, colNumber) {
			console.log('Cell ' + colNumber + ' = ' + cell.value);
		});
		row.commit();
	*/

		$('#generated-year-data').html(
			`
				<table class="cinereousTable ypgr-table">
					<thead>
					<tr><td></td>${daysTop.map(value => `<td class="ypgr-table-day">${value}</td>`).join('')} </tr>
					</thead>
					<tr><td class="ypgr-table-month">Jan</td>  ${generateConcatArray(yearData, 0).join('')}</tr>
					<tr><td class="ypgr-table-month">Feb</td>  ${generateConcatArray(yearData, 1).join('')}</tr>
					<tr><td class="ypgr-table-month">Mar</td>  ${generateConcatArray(yearData, 2).join('')}</tr>
					<tr><td class="ypgr-table-month">Apr</td>  ${generateConcatArray(yearData, 3).join('')}</tr>
					<tr><td class="ypgr-table-month">May</td>  ${generateConcatArray(yearData, 4).join('')}</tr>
					<tr><td class="ypgr-table-month">Jun</td>  ${generateConcatArray(yearData, 5).join('')}</tr>
					<tr><td class="ypgr-table-month">Jul</td>  ${generateConcatArray(yearData, 6).join('')}</tr>
					<tr><td class="ypgr-table-month">Aug</td>  ${generateConcatArray(yearData, 7).join('')}</tr>
					<tr><td class="ypgr-table-month">Sep</td>  ${generateConcatArray(yearData, 8).join('')}</tr>
					<tr><td class="ypgr-table-month">Oct</td>  ${generateConcatArray(yearData, 9).join('')}</tr>
					<tr><td class="ypgr-table-month">Nov</td>  ${generateConcatArray(yearData, 10).join('')}</tr>
					<tr><td class="ypgr-table-month">Dec</td>  ${generateConcatArray(yearData, 11).join('')}</tr>
				</table>
			`
		)
	}
	// Download file once we are done with creating the year planner.
	// XLSX.writeFile(workbook, `YPGr-${year}.xlsb`);
}

function downloadYearPlan(year) {
	// Download file once we are done with creating the year planner.
	// XLSX.writeFile(window.workbook, `YPGr-${year}.xlsb`);
	// window.workbook.xlsx.writeFile(`${year}.xlsx`).then(() => {
	// 	// done
	// });
	window.print();
	/*
	window.workbook.xlsx.writeBuffer().then(buffer => {
		const blob=new Blob([buffer], {type: "application/octet-stream"});// change resultByte to bytes

		const link = document.createElement('a');
		link.href = window.URL.createObjectURL(blob);
		link.download = `${year}.xlsx`;
		link.click();
	});*/
}

function generateConcatArray(yearData, monthIndex) {
	let daysToFillAtEnd = 6 - yearData[monthIndex][yearData[monthIndex].length - 1] + 1;
	if (daysToFillAtEnd === 7) {
		daysToFillAtEnd = 0;
	}
	// return [].concat(new Array(yearData[monthIndex][0]).fill(''), yearData[monthIndex].map(value => '='), new Array(daysToFillAtEnd).fill(''));
	// return [].concat(new Array(yearData[monthIndex][0]).fill('<td class="ypgr-tab-inactive"></td>'), yearData[monthIndex].map(value => '<td class="ypgr-tab-active"></td>'), new Array(daysToFillAtEnd).fill('<td class="ypgr-tab-inactive"></td>'));
	return [].concat(new Array(yearData[monthIndex][0]).fill('<td class="ypgr-tab-inactive"></td>'), yearData[monthIndex].map(value => '<td class="ypgr-tab-active"></td>'));
}