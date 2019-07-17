
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
/* Uses a webworker if window.Worker exists other wise does calculation on main thread. */
function createWorkbookForYear(year) {
	window.workbook = XLSX.utils.book_new();

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
		for (let i = 0 ; i < 6; i++) {
			daysTop = daysTop.concat(YGPrCore.dayMap);
		}
		console.log(daysTop.length);
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
		const worksheet = XLSX.utils.aoa_to_sheet(yearSheetData);
		XLSX.utils.book_append_sheet(window.workbook, worksheet,'Planner');
		$('#generated-year-data').html(
			`
				<table class="cinereousTable">
					<thead>
					<tr><td></td>${daysTop.map(value => `<td>${value}</td>`).join('')} </tr>
					</thead>
					<tr><td>Jan</td>  ${generateConcatArray(yearData, 0).join('')}</tr>
					<tr><td>Feb</td>  ${generateConcatArray(yearData, 1).join('')}</tr>
					<tr><td>Mar</td>  ${generateConcatArray(yearData, 2).join('')}</tr>
					<tr><td>Apr</td>  ${generateConcatArray(yearData, 3).join('')}</tr>
					<tr><td>May</td>  ${generateConcatArray(yearData, 4).join('')}</tr>
					<tr><td>Jun</td>  ${generateConcatArray(yearData, 5).join('')}</tr>
					<tr><td>Jul</td>  ${generateConcatArray(yearData, 6).join('')}</tr>
					<tr><td>Aug</td>  ${generateConcatArray(yearData, 7).join('')}</tr>
					<tr><td>Sep</td>  ${generateConcatArray(yearData, 8).join('')}</tr>
					<tr><td>Oct</td>  ${generateConcatArray(yearData, 9).join('')}</tr>
					<tr><td>Nov</td>  ${generateConcatArray(yearData, 10).join('')}</tr>
					<tr><td>Dec</td>  ${generateConcatArray(yearData, 11).join('')}</tr>
				</table>
			`
		)
	}
	// Download file once we are done with creating the year planner.
	// XLSX.writeFile(workbook, `YPGr-${year}.xlsb`);
}

function downloadYearPlan(year) {
	// Download file once we are done with creating the year planner.
	XLSX.writeFile(window.workbook, `YPGr-${year}.xlsb`);
}

function generateConcatArray(yearData, monthIndex) {
	let daysToFillAtEnd = 6 - yearData[monthIndex][yearData[monthIndex].length - 1] + 1;
	if (daysToFillAtEnd === 7) {
		daysToFillAtEnd = 0;
	}
	return [].concat(new Array(yearData[monthIndex][0]).fill('<td style="">X</td>'), yearData[monthIndex].map(value => '<td>=</td>'), new Array(daysToFillAtEnd).fill('<td>X</td>'));
}